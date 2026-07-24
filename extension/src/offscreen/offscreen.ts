import type { ExtensionMessage } from '../lib/types';
import { reTranscribe } from './localStt';

type SpeechRecognitionConstructor = new () => SpeechRecognition;

let recognition: SpeechRecognition | undefined;
let shouldListen = false;
let isRecognizing = false;

// --- Parallel Audio Capture State for Offline Whisper Fallback ---
let audioStream: MediaStream | null = null;
let audioContext: AudioContext | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let audioChunks: Float32Array[] = [];
let totalAudioSamples = 0;
const MAX_SAMPLES = 16000 * 15; // Max 15 seconds of audio buffer

async function initAudioCapture() {
  if (audioContext && audioStream) return;

  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(audioStream);
    scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    scriptProcessor.onaudioprocess = (e) => {
      if (!shouldListen) return;
      const inputBuffer = e.inputBuffer.getChannelData(0);
      const copy = new Float32Array(inputBuffer.length);
      copy.set(inputBuffer);

      audioChunks.push(copy);
      totalAudioSamples += copy.length;

      // Trim oldest chunks if buffer exceeds MAX_SAMPLES
      while (totalAudioSamples > MAX_SAMPLES && audioChunks.length > 0) {
        const removed = audioChunks.shift();
        if (removed) {
          totalAudioSamples -= removed.length;
        }
      }
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);
  } catch (err) {
    console.warn('Could not initialize parallel audio capture for fallback STT:', err);
  }
}

function clearAudioBuffer() {
  audioChunks = [];
  totalAudioSamples = 0;
}

function getMergedAudioBuffer(): Float32Array {
  const merged = new Float32Array(totalAudioSamples);
  let offset = 0;
  for (const chunk of audioChunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

function stopAudioCapture() {
  if (scriptProcessor) {
    scriptProcessor.disconnect();
    scriptProcessor = null;
  }
  if (audioContext) {
    void audioContext.close();
    audioContext = null;
  }
  if (audioStream) {
    audioStream.getTracks().forEach((track) => track.stop());
    audioStream = null;
  }
  clearAudioBuffer();
}

// --- Message Listener ---
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'START_LISTENING') {
    void startRecognition();
  } else if (message.type === 'STOP_LISTENING') {
    stopRecognition();
  } else if (message.type === 'FALLBACK_STT') {
    handleFallbackSTT()
      .then((resText) => {
        try {
          sendResponse({ type: 'FALLBACK_STT_RESULT', text: resText } satisfies ExtensionMessage);
        } catch {
          // Channel closed
        }
      })
      .catch((err) => {
        console.error('Fallback STT error:', err);
        try {
          sendResponse({ type: 'FALLBACK_STT_RESULT', text: '' } satisfies ExtensionMessage);
        } catch {
          // Channel closed
        }
      });
    return true; // Async sendResponse
  }
});

async function handleFallbackSTT(): Promise<string> {
  const buffer = getMergedAudioBuffer();
  if (buffer.length === 0) {
    return '';
  }

  chrome.runtime.sendMessage({
    type: 'PANEL_UPDATE',
    payload: { status: 'Re-checking audio with offline Whisper model...' }
  } satisfies ExtensionMessage);

  try {
    const text = await reTranscribe(buffer, (progressMsg) => {
      chrome.runtime.sendMessage({
        type: 'PANEL_UPDATE',
        payload: { status: progressMsg }
      } satisfies ExtensionMessage);
    });
    return text;
  } catch (err) {
    console.error('Local Whisper transcription failed:', err);
    return '';
  }
}

async function startRecognition() {
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

  if (!Recognition) {
    chrome.runtime.sendMessage({
      type: 'PANEL_UPDATE',
      payload: { status: 'Speech recognition is unavailable in this Chrome context.', listening: false }
    } satisfies ExtensionMessage);
    return;
  }

  shouldListen = true;
  await initAudioCapture();

  if (!recognition) {
    recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    recognition.onresult = (event) => {
      let interim = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript.trim() ?? '';
        const confidence = result[0]?.confidence;

        if (result.isFinal) {
          chrome.runtime.sendMessage({
            type: 'TRANSCRIPT_FINAL',
            text: transcript,
            confidence
          } satisfies ExtensionMessage);
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        chrome.runtime.sendMessage({ type: 'TRANSCRIPT_INTERIM', text: interim } satisfies ExtensionMessage);
      }
    };

    recognition.onend = () => {
      isRecognizing = false;
      if (shouldListen) {
        try {
          isRecognizing = true;
          recognition?.start();
          // Clear any previous error status when successfully restarted
          chrome.runtime.sendMessage({
            type: 'PANEL_UPDATE',
            payload: { status: 'Listening', listening: true }
          } satisfies ExtensionMessage);
        } catch {
          isRecognizing = false;
        }
      }
    };

    recognition.onerror = (event) => {
      isRecognizing = false;

      // These errors are normal and don't need user-facing alerts
      const silentErrors = ['no-speech', 'aborted'];
      if (silentErrors.includes(event.error)) {
        // Auto-restart if we should still be listening
        if (shouldListen) {
          setTimeout(() => {
            if (shouldListen && !isRecognizing) {
              try {
                isRecognizing = true;
                recognition?.start();
              } catch {
                isRecognizing = false;
              }
            }
          }, 300);
        }
        return;
      }

      // Network or service errors — show briefly, then auto-retry
      chrome.runtime.sendMessage({
        type: 'PANEL_UPDATE',
        payload: { status: `Speech recognition error: ${event.error}. Retrying...`, listening: shouldListen }
      } satisfies ExtensionMessage);

      if (shouldListen) {
        setTimeout(() => {
          if (shouldListen && !isRecognizing) {
            try {
              isRecognizing = true;
              recognition?.start();
            } catch {
              isRecognizing = false;
            }
          }
        }, 1500);
      }
    };
  }

  if (!isRecognizing) {
    try {
      isRecognizing = true;
      recognition.start();
    } catch {
      isRecognizing = false;
    }
  }
}

function stopRecognition() {
  shouldListen = false;
  isRecognizing = false;
  try {
    recognition?.stop();
  } catch {
    // Already stopped
  }
  stopAudioCapture();
}
