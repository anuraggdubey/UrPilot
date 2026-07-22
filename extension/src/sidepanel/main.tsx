import React from 'react';
import { createRoot } from 'react-dom/client';
import { Mic, MicOff, Square, Volume2 } from 'lucide-react';
import '../styles.css';
import type { ExtensionMessage, PanelPayload } from '../lib/types';

function SidePanel() {
  const [panel, setPanel] = React.useState<PanelPayload>({ status: 'Idle', listening: false });
  const [manualCommand, setManualCommand] = React.useState('');

  React.useEffect(() => {
    const listener = (message: ExtensionMessage) => {
      if (message.type === 'PANEL_UPDATE') {
        setPanel((current) => ({ ...current, ...message.payload }));
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const send = (message: ExtensionMessage) => chrome.runtime.sendMessage(message);

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-ink">
      <section className="border-b border-mist bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">UrPilot</h1>
            <p className="text-xs text-slate-500">{panel.status}</p>
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-moss text-white shadow-sm"
            title={panel.listening ? 'Stop listening' : 'Start listening'}
            onClick={() => send({ type: 'TOGGLE_LISTENING' })}
          >
            {panel.listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
      </section>

      <section className="space-y-4 px-4 py-4">
        <div className="rounded-md border border-mist bg-white p-3">
          <label className="text-xs font-medium text-slate-600" htmlFor="manual-command">
            Command
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="manual-command"
              className="min-w-0 flex-1 rounded-md border border-mist px-3 py-2 text-sm outline-none focus:border-moss"
              value={manualCommand}
              onChange={(event) => setManualCommand(event.target.value)}
              placeholder="search Stellar Soroban docs and summarize it"
            />
            <button
              className="rounded-md bg-coral px-3 py-2 text-sm font-medium text-white"
              onClick={() => {
                if (manualCommand.trim()) {
                  send({ type: 'ROUTE_COMMAND', transcript: manualCommand.trim() });
                  setManualCommand('');
                }
              }}
            >
              Run
            </button>
          </div>
        </div>

        {panel.transcript && (
          <div className="rounded-md border border-mist bg-white p-3">
            <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Transcript</h2>
            <p className="mt-2 text-sm">{panel.transcript}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-mist bg-white px-3 py-2 text-sm font-medium"
            onClick={() => send({ type: 'ROUTE_COMMAND', transcript: 'summarize this page' })}
          >
            <Volume2 size={16} />
            Summarize
          </button>
          <button
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-mist bg-white px-3 py-2 text-sm font-medium"
            onClick={() => send({ type: 'STOP_SPEAKING' })}
          >
            <Square size={16} />
            Stop
          </button>
        </div>

        {panel.error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{panel.error}</p>}

        {panel.summary && (
          <article className="rounded-md border border-mist bg-white p-3">
            <h2 className="text-sm font-semibold">Summary</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{panel.summary}</p>
          </article>
        )}

        {panel.keyPoints && panel.keyPoints.length > 0 && (
          <div className="rounded-md border border-mist bg-white p-3">
            <h2 className="text-sm font-semibold">Key Points</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
              {panel.keyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<SidePanel />);
