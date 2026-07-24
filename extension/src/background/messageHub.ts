import type { ExtensionMessage, PanelPayload } from '../lib/types';

export function broadcastPanelUpdate(payload: Partial<PanelPayload>) {
  chrome.runtime.sendMessage({ type: 'PANEL_UPDATE', payload } satisfies ExtensionMessage).catch(() => {
    // The side panel may be closed; command execution should continue.
  });
}

export function speak(text: string) {
  chrome.tts.stop();
  chrome.tts.speak(text, {
    rate: 1,
    enqueue: false
  });
}

export function stopSpeaking() {
  chrome.tts.stop();
}
