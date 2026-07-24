import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Mic,
  Settings,
  Square,
  Volume2,
  Copy,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Check,
  MessageSquare,
} from 'lucide-react';
import '../styles.css';
import type { ExtensionMessage, PanelPayload } from '../lib/types';
import { getSettings } from '../lib/storage';

function SidePanel() {
  const [panel, setPanel] = React.useState<PanelPayload>({
    status: 'Ready when you are.',
    listening: false,
    speaking: false,
    processing: false,
  });
  const [manualCommand, setManualCommand] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [savedLinksCount, setSavedLinksCount] = React.useState(0);

  React.useEffect(() => {
    void getSettings().then((settings) => {
      setSavedLinksCount(settings.savedLinks.length);
    });

    const listener = (message: ExtensionMessage) => {
      if (message.type === 'PANEL_UPDATE') {
        setPanel((current) => ({ ...current, ...message.payload }));
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const send = (message: ExtensionMessage) => chrome.runtime.sendMessage(message);

  const handleCopy = () => {
    if (panel.summary) {
      navigator.clipboard.writeText(panel.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openOptions = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  const [showGuide, setShowGuide] = React.useState(false);

  return (
    <main className="flex min-h-screen flex-col bg-[#F5F0E6] font-sans text-[#17160F] antialiased">
      {/* Header Bar */}
      <header className="flex h-[44px] items-center justify-between border-b border-[#17160F]/15 bg-[#F5F0E6] px-4">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold text-[#17160F]">UrPilot</span>
          {panel.listening ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase animate-pulse">
              ● LIVE
            </span>
          ) : panel.readAloudStatus === 'playing' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
              READING ALOUD
            </span>
          ) : panel.summary ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#454F32] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
              DONE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500">
              READY
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="rounded-full bg-white border border-[#17160F]/20 px-2.5 py-1 text-[11px] font-bold text-[#17160F] hover:bg-[#EFB92E] transition-colors"
            title="Toggle Voice Commands Guide"
          >
            {showGuide ? 'Hide Guide' : 'User Guide'}
          </button>
          <button
            onClick={openOptions}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#17160F] hover:bg-[#17160F]/10 transition-colors"
            title="Open Settings"
            aria-label="Open Settings"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 p-4">
        {/* Permission Denied Card */}
        {panel.micPermissionDenied && (
          <section className="rounded-xl border border-red-300 bg-red-50 p-3 space-y-2 text-xs text-red-700">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert size={16} />
              <span>Microphone Access Needed</span>
            </div>
            <p>Please grant microphone permission to enable voice triggers.</p>
            <button
              onClick={() => send({ type: 'START_LISTENING' })}
              className="w-full rounded-lg bg-red-600 py-1.5 font-bold text-white"
            >
              Grant Permission
            </button>
          </section>
        )}

        {/* Hero Mic Console Container */}
        <section className="flex flex-col items-center justify-center rounded-2xl border border-[#17160F]/15 bg-white py-6 px-4 text-center shadow-sm space-y-3">
          <div className="relative my-2 flex items-center justify-center">
            {panel.listening && (
              <div className="absolute inset-0 rounded-full bg-[#EFB92E] opacity-40 animate-ping pointer-events-none" />
            )}
            <button
              onClick={() => send({ type: 'TOGGLE_LISTENING' })}
              className={`group relative flex h-20 w-20 items-center justify-center rounded-full border border-[#17160F] transition-all active:scale-95 ${
                panel.listening
                  ? 'bg-red-500 text-white'
                  : panel.processing
                  ? 'bg-amber-500 text-white'
                  : panel.speaking || panel.readAloudStatus === 'playing'
                  ? 'bg-[#454F32] text-white'
                  : 'bg-[#EFB92E] text-[#17160F] hover:scale-105 shadow-sm'
              }`}
            >
              <Mic className="h-8 w-8 transition-transform group-hover:scale-110" />
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-sm font-bold text-[#17160F]">
              {panel.status || 'Ready when you are.'}
            </h2>
            {panel.error ? (
              <p className="font-sans text-xs text-red-600 font-medium max-w-xs mx-auto px-2">
                {panel.error}
              </p>
            ) : (
              <p className="font-sans text-xs italic text-slate-500">
                {panel.listening ? 'Listening... say "read page aloud", "close duplicates", "speed up 2x"...' : '"summarize this page..."'}
              </p>
            )}
          </div>

          {panel.listening && (
            <button
              onClick={() => send({ type: 'STOP_LISTENING' })}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-400 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              <Square size={12} />
              Stop Listening
            </button>
          )}
        </section>

        {/* VOICE COMMANDS & USER GUIDE SECTION */}
        {showGuide && (
          <section className="rounded-2xl border border-[#17160F]/20 bg-white p-4 space-y-4 shadow-sm text-xs">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-display text-sm font-bold text-[#17160F]">📖 UrPilot Voice User Guide</h3>
              <p className="text-[11px] text-slate-500">Speak any of these commands naturally or click a button to execute.</p>
            </div>

            {/* Guide Category 1: Speech & Playback Control */}
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] font-bold text-[#454F32] uppercase">🗣️ SPEECH & PLAYBACK CONTROL</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { cmd: 'stop', label: 'stop' },
                  { cmd: 'pause', label: 'pause' },
                  { cmd: 'continue', label: 'continue / resume' },
                  { cmd: 'start', label: 'start / start over' },
                  { cmd: 'read page aloud', label: 'read page aloud' }
                ].map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => send({ type: 'ROUTE_COMMAND', transcript: item.cmd })}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-[#EFB92E]/20 transition-colors"
                  >
                    <div className="font-mono text-[10px] font-bold text-slate-700">"{item.label}"</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guide Category 2: Tab Management */}
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] font-bold text-[#454F32] uppercase">🗂️ TAB MANAGEMENT & NAVIGATION</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { cmd: 'close this tab', label: 'close this tab' },
                  { cmd: 'close duplicate tabs', label: 'close duplicate tabs' },
                  { cmd: 'close all tabs except this', label: 'close other tabs' },
                  { cmd: 'open tab no. 3', label: 'open tab no. 3' },
                  { cmd: 'move to 2nd tab', label: 'move to 2nd tab' },
                  { cmd: 'next tab', label: 'next tab / prev tab' },
                  { cmd: 'mute other tabs', label: 'mute other tabs' },
                  { cmd: 'mute meet tab', label: 'mute meet tab' },
                  { cmd: 'pin this tab', label: 'pin / unpin tab' },
                  { cmd: 'reopen closed tab', label: 'reopen closed tab' },
                  { cmd: 'group tabs by domain', label: 'group tabs by domain' }
                ].map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => send({ type: 'ROUTE_COMMAND', transcript: item.cmd })}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-[#EFB92E]/20 transition-colors"
                  >
                    <div className="font-mono text-[10px] font-bold text-slate-700">"{item.label}"</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guide Category 3: Media & Video */}
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] font-bold text-[#454F32] uppercase">🎬 MEDIA & VIDEO CONTROLS</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { cmd: 'pause video', label: 'pause video' },
                  { cmd: 'play video', label: 'play video' },
                  { cmd: 'mute video', label: 'mute video' },
                  { cmd: 'speed up 2x', label: 'speed up 2x' },
                  { cmd: 'speed up 1.5x', label: 'speed up 1.5x' },
                  { cmd: 'normal speed', label: 'normal speed (1x)' }
                ].map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => send({ type: 'ROUTE_COMMAND', transcript: item.cmd })}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-[#EFB92E]/20 transition-colors"
                  >
                    <div className="font-mono text-[10px] font-bold text-slate-700">"{item.label}"</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guide Category 4: Page Utilities & Timers */}
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] font-bold text-[#454F32] uppercase">⚡ UTILITIES & TIMERS</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { cmd: 'clean view', label: 'clean view / reader' },
                  { cmd: 'copy url', label: 'copy url' },
                  { cmd: 'take screenshot', label: 'take screenshot' },
                  { cmd: 'scroll down', label: 'scroll down / up' },
                  { cmd: 'highlight stellar on page', label: 'highlight [word]' },
                  { cmd: 'set a timer for 15 minutes', label: 'set timer for 15 min' }
                ].map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => send({ type: 'ROUTE_COMMAND', transcript: item.cmd })}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-[#EFB92E]/20 transition-colors"
                  >
                    <div className="font-mono text-[10px] font-bold text-slate-700">"{item.label}"</div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Clean Reader View Display */}
        {panel.readerModeActive && panel.readerContent && (
          <section className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <span className="font-mono text-[10px] font-bold text-emerald-800 uppercase">📖 CLEAN READER MODE</span>
              <button
                onClick={() => setPanel((p) => ({ ...p, readerModeActive: false }))}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Close View
              </button>
            </div>
            <h3 className="font-display text-sm font-bold text-emerald-950">{panel.readerContent.title}</h3>
            <div className="max-h-60 overflow-y-auto text-xs text-emerald-900 leading-relaxed whitespace-pre-wrap pr-1 font-serif bg-white/80 p-3 rounded-lg border border-emerald-100">
              {panel.readerContent.text}
            </div>
          </section>
        )}

        {/* Action Pills Menu */}
        <section className="space-y-1.5">
          <button
            onClick={() => send({ type: 'ROUTE_COMMAND', transcript: 'open my stuff' })}
            className="w-full text-left rounded-xl border border-[#17160F]/15 bg-white p-3 text-xs font-semibold text-[#17160F] hover:bg-[#EFB92E] transition-colors flex items-center justify-between shadow-sm"
          >
            <span>Open my stuff ({savedLinksCount})</span>
            <ChevronRight size={14} />
          </button>

          <button
            onClick={() => send({ type: 'ROUTE_COMMAND', transcript: 'read page aloud' })}
            className="w-full text-left rounded-xl border border-[#17160F]/15 bg-white p-3 text-xs font-semibold text-[#17160F] hover:bg-[#EFB92E] transition-colors flex items-center justify-between shadow-sm"
          >
            <span>Read page aloud</span>
            <ChevronRight size={14} />
          </button>

          <button
            onClick={() => send({ type: 'ROUTE_COMMAND', transcript: 'clean view' })}
            className="w-full text-left rounded-xl border border-[#17160F]/15 bg-white p-3 text-xs font-semibold text-[#17160F] hover:bg-[#EFB92E] transition-colors flex items-center justify-between shadow-sm"
          >
            <span>Clean reader view</span>
            <ChevronRight size={14} />
          </button>
        </section>

        {/* Transcript Box */}
        {(panel.transcript || panel.interimTranscript) && (
          <section className="rounded-xl border border-[#17160F]/15 bg-white p-3 space-y-1">
            <div className="font-mono text-[10px] font-bold text-slate-400 uppercase">TRANSCRIPT</div>
            <p className="text-xs text-[#17160F]">
              {panel.transcript}
              {panel.interimTranscript && <span className="italic text-slate-400"> {panel.interimTranscript}</span>}
            </p>
          </section>
        )}

        {/* Summary Card */}
        {panel.summary && (
          <section className="rounded-xl border border-[#17160F]/15 bg-white p-4 space-y-3 shadow-sm">
            {panel.sourceUrl && (
              <a
                href={panel.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500 hover:underline truncate max-w-full"
              >
                <ExternalLink size={10} />
                <span className="truncate">↳ {panel.sourceUrl}</span>
              </a>
            )}

            <h3 className="font-display text-sm font-bold text-[#17160F]">
              {panel.sourceTitle || 'Page Summary'}
            </h3>

            <p className="text-xs text-[#17160F] leading-relaxed whitespace-pre-wrap">{panel.summary}</p>

            {panel.keyPoints && panel.keyPoints.length > 0 && (
              <div className="border-t border-slate-100 pt-2 space-y-1">
                <div className="text-[10px] font-mono font-bold text-slate-400">KEY POINTS</div>
                <ul className="space-y-1 text-xs text-[#17160F]">
                  {panel.keyPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#EFB92E] font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() =>
                  send(panel.speaking ? { type: 'STOP_SPEAKING' } : { type: 'SPEAK', text: panel.spokenSummary || panel.summary! })
                }
                className={`flex-1 rounded-full border border-[#17160F] py-1.5 text-xs font-bold transition-all ${
                  panel.speaking ? 'bg-[#454F32] text-white' : 'bg-[#EFB92E] text-[#17160F]'
                }`}
              >
                {panel.speaking ? 'Stop' : 'Read Aloud'}
              </button>

              <button
                onClick={handleCopy}
                className="rounded-full border border-[#17160F]/20 px-3 py-1.5 text-xs font-semibold text-[#17160F] hover:bg-slate-100"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </section>
        )}

        {/* Tweet / Reply Suggestions Card */}
        {panel.replySuggestions && panel.replySuggestions.length > 0 && (
          <section className="rounded-xl border border-[#17160F]/15 bg-white p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 font-display text-sm font-bold text-[#17160F]">
                <MessageSquare size={16} className="text-[#EFB92E]" />
                <span>Tweet & Reply Suggestions</span>
              </div>
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">AI ASSISTANT</span>
            </div>

            <p className="text-xs text-slate-600">
              Click <strong className="text-[#17160F]">Copy Reply</strong> on any option below to paste into your comment/tweet box:
            </p>

            <div className="space-y-2.5">
              {panel.replySuggestions.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2 hover:border-[#EFB92E] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#17160F] px-2 py-0.5 font-mono text-[10px] font-bold text-[#EFB92E]">
                      {item.style}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.text);
                        setCopiedIndex(idx);
                        setTimeout(() => setCopiedIndex(null), 2000);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-[#17160F] bg-[#EFB92E] px-2.5 py-1 text-[11px] font-bold text-[#17160F] hover:bg-[#17160F] hover:text-white transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={12} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#17160F] font-sans leading-relaxed select-all">
                    "{item.text}"
                  </p>
                </div>
              ))}
            </div>

            {panel.spokenSummary && (
              <button
                onClick={() =>
                  send(panel.speaking ? { type: 'STOP_SPEAKING' } : { type: 'SPEAK', text: panel.spokenSummary! })
                }
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 text-xs font-semibold text-[#17160F] hover:bg-slate-100"
              >
                {panel.speaking ? 'Stop Voice Readout' : '🔊 Listen to Summary'}
              </button>
            )}
          </section>
        )}

        {/* Manual Keyboard Command Entry */}
        <section className="rounded-xl border border-[#17160F]/15 bg-white p-3 space-y-2">
          <label htmlFor="manual-cmd" className="block font-mono text-[10px] font-bold text-slate-400 uppercase">
            TYPE COMMAND
          </label>
          <div className="flex gap-2">
            <input
              id="manual-cmd"
              type="text"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-[#17160F] outline-none focus:border-[#EFB92E]"
              placeholder="e.g. read page aloud, close duplicates, 2x speed"
              value={manualCommand}
              onChange={(e) => setManualCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualCommand.trim()) {
                  send({ type: 'ROUTE_COMMAND', transcript: manualCommand.trim() });
                  setManualCommand('');
                }
              }}
            />
            <button
              onClick={() => {
                if (manualCommand.trim()) {
                  send({ type: 'ROUTE_COMMAND', transcript: manualCommand.trim() });
                  setManualCommand('');
                }
              }}
              className="rounded-lg bg-[#17160F] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#EFB92E] hover:text-[#17160F]"
            >
              Run
            </button>
          </div>
        </section>
      </div>

      <footer className="border-t border-[#17160F]/15 py-2 px-4 text-center font-mono text-[9px] text-slate-500">
        URPILOT V0.1.0 • OFFLINE VOICE & BROWSER AUTOMATION
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<SidePanel />);
