import type { ExtensionMessage } from '../lib/types';

type SpeechRecognitionConstructor = new () => SpeechRecognition;

let recognition: SpeechRecognition | undefined;
let shouldListen = false;
let isRecognizing = false;

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  if (message.type === 'START_LISTENING') {
    startRecognition();
  }

  if (message.type === 'STOP_LISTENING') {
    stopRecognition();
  }
});

function startRecognition() {
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

  if (!Recognition) {
    chrome.runtime.sendMessage({
      type: 'PANEL_UPDATE',
      payload: { status: 'Speech recognition is unavailable in this Chrome context.', listening: false }
    } satisfies ExtensionMessage);
    return;
  }

  shouldListen = true;

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

        if (result.isFinal) {
          chrome.runtime.sendMessage({ type: 'TRANSCRIPT_FINAL', text: transcript } satisfies ExtensionMessage);
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
}
