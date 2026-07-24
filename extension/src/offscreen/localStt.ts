import { pipeline, env } from '@huggingface/transformers';

// Configure transformers env for browser/extension environment
env.allowLocalModels = false;
env.allowRemoteModels = true;
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.proxy = false;
  env.backends.onnx.wasm.numThreads = 1;
}

let transcriber: any = null;
let isLoading = false;
let loadError: string | null = null;

export async function getLocalTranscriber(onProgress?: (progressMsg: string) => void) {
  if (transcriber) {
    return transcriber;
  }
  if (isLoading) {
    // Wait until loaded
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    if (transcriber) return transcriber;
  }

  isLoading = true;
  loadError = null;

  try {
    if (onProgress) onProgress('Loading offline speech recognition model...');

    // Try WebGPU first, fallback to WASM if WebGPU is not available
    let device: 'webgpu' | 'wasm' = 'wasm';
    if (typeof navigator !== 'undefined' && 'gpu' in navigator && navigator.gpu) {
      device = 'webgpu';
    }

    transcriber = await pipeline(
      'automatic-speech-recognition',
      'onnx-community/whisper-tiny.en',
      {
        device,
        progress_callback: (progress: any) => {
          if (progress?.status === 'downloading' && onProgress) {
            const pct = Math.round((progress.loaded / progress.total) * 100) || 0;
            onProgress(`Downloading offline model (${pct}%)...`);
          }
        }
      }
    );

    if (onProgress) onProgress('Offline model loaded.');
    return transcriber;
  } catch (err: any) {
    console.warn('Failed to load local STT model with preferred device, trying fallback WASM:', err);
    try {
      transcriber = await pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-tiny.en',
        { device: 'wasm' }
      );
      return transcriber;
    } catch (fallbackErr: any) {
      loadError = fallbackErr?.message || String(fallbackErr);
      console.error('Local STT initialization failed:', fallbackErr);
      throw fallbackErr;
    }
  } finally {
    isLoading = false;
  }
}

export async function reTranscribe(
  audioBuffer: Float32Array,
  onProgress?: (progressMsg: string) => void
): Promise<string> {
  if (audioBuffer.length === 0) {
    return '';
  }

  try {
    const model = await getLocalTranscriber(onProgress);
    const result = await model(audioBuffer);

    if (Array.isArray(result)) {
      return (result[0]?.text || '').trim();
    }
    return (result?.text || '').trim();
  } catch (err) {
    console.warn('Local Whisper reTranscribe failed or blocked by environment, falling back:', err);
    return '';
  }
}
