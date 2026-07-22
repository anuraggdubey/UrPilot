import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  GripVertical,
  Plus,
  RotateCcw,
  Check,
  Globe,
  Sliders,
  Sparkles,
  Volume2,
  Mic,
  Layers,
  ArrowRight,
  ShieldCheck,
  Server,
  Trash2,
} from 'lucide-react';
import '../styles.css';
import {
  getSettings,
  setBackendBaseUrl,
  setSavedLinks,
  setSiteTemplates,
  setUserPreferences,
} from '../lib/storage';
import { defaultSiteTemplates } from '../lib/siteTemplates';
import type { SavedLink, SiteTemplate, UserPreferences } from '../lib/types';

type Tab = 'links' | 'templates' | 'settings' | 'onboarding';

function OptionsPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>('links');
  const [savedLinks, setLinks] = React.useState<SavedLink[]>([]);
  const [templates, setTemplates] = React.useState<SiteTemplate[]>([]);
  const [backendBaseUrl, setBackendUrl] = React.useState('');
  const [prefs, setPrefs] = React.useState<UserPreferences>({
    autoRestartOnSilence: true,
    autoReadSummaries: false,
    playbackSpeed: 1.0,
    activeModel: 'Groq (llama-3.3-70b-versatile)',
    pushToTalkShortcut: 'Ctrl+Shift+L',
  });

  // Confirm delete temporary state mapping: id -> boolean
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<Record<string, boolean>>({});

  // Onboarding step (1, 2, 3)
  const [onboardingStep, setOnboardingStep] = React.useState(1);
  const [newFirstLinkLabel, setNewFirstLinkLabel] = React.useState('');
  const [newFirstLinkUrl, setNewFirstLinkUrl] = React.useState('');
  const [onboardingSuccess, setOnboardingSuccess] = React.useState(false);

  React.useEffect(() => {
    void getSettings().then((settings) => {
      setLinks(settings.savedLinks);
      setTemplates(settings.siteTemplates);
      setBackendUrl(settings.backendBaseUrl);
      if (settings.userPreferences) {
        setPrefs(settings.userPreferences);
      }
    });
  }, []);

  async function persistLinks(next: SavedLink[]) {
    setLinks(next);
    await setSavedLinks(next);
  }

  async function persistTemplates(next: SiteTemplate[]) {
    setTemplates(next);
    await setSiteTemplates(next);
  }

  async function updatePref<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await setUserPreferences({ [key]: value });
  }

  const handleDeleteLink = async (id: string) => {
    if (!confirmDeleteId[id]) {
      setConfirmDeleteId((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setConfirmDeleteId((prev) => ({ ...prev, [id]: false }));
      }, 3000);
      return;
    }
    const next = savedLinks.filter((l) => l.id !== id);
    await persistLinks(next);
    setConfirmDeleteId((prev) => ({ ...prev, [id]: false }));
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirmDeleteId[id]) {
      setConfirmDeleteId((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setConfirmDeleteId((prev) => ({ ...prev, [id]: false }));
      }, 3000);
      return;
    }
    const next = templates.filter((t) => t.id !== id);
    await persistTemplates(next);
    setConfirmDeleteId((prev) => ({ ...prev, [id]: false }));
  };

  // Helper renderer for URL templates highlighting {q}
  const renderTemplatePreview = (urlTemplate: string) => {
    const parts = urlTemplate.split('{q}');
    if (parts.length === 1) return <span>{urlTemplate}</span>;
    return (
      <span className="font-mono text-xs">
        {parts[0]}
        <span className="bg-mustard text-ink px-1 py-0.5 font-bold uppercase tracking-wider text-[10px]">
          {'{q}'}
        </span>
        {parts[1]}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-cream font-sans text-ink antialiased">
      {/* Top Ink Bar Navigation */}
      <header className="border-b border-line-strong bg-ink px-6 py-0 text-cream">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3 py-3">
            <span className="font-display text-lg font-extrabold tracking-widest text-mustard">▣ URPILOT</span>
            <span className="border-l border-white/20 pl-3 text-xs font-semibold text-cream/70">
              SETTINGS & CONFIGURATION
            </span>
          </div>

          <nav className="flex gap-2">
            {[
              { id: 'links', label: 'SAVED LINKS' },
              { id: 'templates', label: 'SITE TEMPLATES' },
              { id: 'settings', label: 'SETTINGS' },
              { id: 'onboarding', label: 'ONBOARDING' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`relative px-4 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab.id ? 'text-mustard font-extrabold' : 'text-cream/70 hover:text-cream'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-mustard" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* TAB 1: SAVED LINKS */}
        {activeTab === 'links' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-line-strong pb-4">
              <div>
                <h1 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
                  SAVED LINKS ("Open My Stuff")
                </h1>
                <p className="text-xs text-ink-soft mt-1">
                  Saying "open my stuff" launches all configured URLs into tabs simultaneously.
                </p>
              </div>
              <button
                onClick={() =>
                  persistLinks([
                    ...savedLinks,
                    {
                      id: crypto.randomUUID(),
                      label: 'New Link',
                      url: 'https://example.com',
                      order: savedLinks.length,
                    },
                  ])
                }
                className="inline-flex items-center gap-2 border border-line-strong bg-mustard px-4 py-2 text-xs font-bold uppercase text-ink hover:bg-mustard-deep active:translate-y-0.5 transition-all shadow-flat"
              >
                <Plus size={14} />
                Add Link
              </button>
            </div>

            <div className="divide-y divide-line border border-line-strong bg-surface">
              {savedLinks.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-line-strong/30 m-4">
                  <p className="font-display text-sm font-bold text-ink uppercase">No Saved Links Yet</p>
                  <p className="text-xs text-ink-soft mt-1">Add your daily URLs above to launch them with voice.</p>
                </div>
              ) : (
                savedLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex flex-wrap items-center gap-3 p-3 transition-colors hover:bg-cream/50"
                  >
                    <span className="cursor-grab text-ink-soft hover:text-ink">
                      <GripVertical size={16} />
                    </span>

                    <input
                      type="text"
                      className="w-36 border border-line-strong bg-cream px-3 py-1.5 text-xs font-semibold text-ink outline-none focus:border-2 focus:border-mustard-deep"
                      value={link.label}
                      onChange={(e) => {
                        const next = savedLinks.map((item) =>
                          item.id === link.id ? { ...item, label: e.target.value } : item
                        );
                        void persistLinks(next);
                      }}
                      placeholder="Label"
                    />

                    <input
                      type="text"
                      className="min-w-0 flex-1 border border-line-strong bg-cream px-3 py-1.5 font-mono text-xs text-ink outline-none focus:border-2 focus:border-mustard-deep"
                      value={link.url}
                      onChange={(e) => {
                        const next = savedLinks.map((item) =>
                          item.id === link.id ? { ...item, url: e.target.value } : item
                        );
                        void persistLinks(next);
                      }}
                      placeholder="https://..."
                    />

                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className={`inline-flex items-center gap-1 border border-line-strong px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                        confirmDeleteId[link.id]
                          ? 'bg-coral text-cream hover:bg-coral/90'
                          : 'bg-cream text-ink hover:bg-coral hover:text-cream'
                      }`}
                    >
                      {confirmDeleteId[link.id] ? (
                        <>Confirm ×</>
                      ) : (
                        <>
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border border-line-strong bg-cream p-4 text-xs text-ink-soft">
              <span className="font-bold text-ink uppercase">Voice Command Tip:</span> Say "open my stuff" or "open my links" into the mic to trigger tab launch.
            </div>
          </section>
        )}

        {/* TAB 2: SITE SEARCH TEMPLATES */}
        {activeTab === 'templates' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-line-strong pb-4">
              <div>
                <h1 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
                  SITE SEARCH TEMPLATES
                </h1>
                <p className="text-xs text-ink-soft mt-1">
                  Say "search [query] on [site]" to route directly to custom search engines.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => persistTemplates(defaultSiteTemplates)}
                  className="inline-flex items-center gap-1.5 border border-line-strong bg-cream px-3 py-2 text-xs font-bold uppercase text-ink hover:bg-ink hover:text-cream transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset Defaults
                </button>
                <button
                  onClick={() =>
                    persistTemplates([
                      ...templates,
                      {
                        id: crypto.randomUUID(),
                        site: 'New Site',
                        urlTemplate: 'https://example.com/search?q={q}',
                      },
                    ])
                  }
                  className="inline-flex items-center gap-2 border border-line-strong bg-mustard px-4 py-2 text-xs font-bold uppercase text-ink hover:bg-mustard-deep transition-all shadow-flat"
                >
                  <Plus size={14} />
                  Add Template
                </button>
              </div>
            </div>

            <div className="divide-y divide-line border border-line-strong bg-surface">
              {templates.map((template) => (
                <div key={template.id} className="p-4 space-y-2 hover:bg-cream/30 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="w-36 border border-line-strong bg-cream px-3 py-1 text-xs font-bold uppercase text-ink outline-none focus:border-2 focus:border-mustard-deep"
                        value={template.site}
                        onChange={(e) => {
                          const next = templates.map((t) =>
                            t.id === template.id ? { ...t, site: e.target.value } : t
                          );
                          void persistTemplates(next);
                        }}
                      />
                      {template.isDefault && (
                        <span className="border border-line-strong bg-cream px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className={`inline-flex items-center gap-1 border border-line-strong px-3 py-1 text-xs font-bold uppercase transition-colors ${
                        confirmDeleteId[template.id]
                          ? 'bg-coral text-cream'
                          : 'bg-cream text-ink hover:bg-coral hover:text-cream'
                      }`}
                    >
                      {confirmDeleteId[template.id] ? 'Confirm ×' : 'Delete'}
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      className="w-full border border-line-strong bg-cream px-3 py-1.5 font-mono text-xs text-ink outline-none focus:border-2 focus:border-mustard-deep"
                      value={template.urlTemplate}
                      onChange={(e) => {
                        const next = templates.map((t) =>
                          t.id === template.id ? { ...t, urlTemplate: e.target.value } : t
                        );
                        void persistTemplates(next);
                      }}
                    />
                  </div>

                  <div className="text-[11px] text-ink-soft pt-1">
                    Live Preview: {renderTemplatePreview(template.urlTemplate)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <section className="space-y-6">
            <div className="border-b border-line-strong pb-4">
              <h1 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
                SYSTEM PREFERENCES
              </h1>
              <p className="text-xs text-ink-soft mt-1">Configure audio feedback, playback speed, and backend models.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* VOICE DOMAIN */}
              <div className="border border-line-strong bg-surface p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-line pb-2">
                  <Mic size={18} className="text-mustard-deep" />
                  <h2 className="font-display text-xs font-bold uppercase tracking-widest text-ink">VOICE DOMAIN</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-ink">Push-to-Talk Shortcut</div>
                      <div className="text-[11px] text-ink-soft">Keyboard trigger for mic</div>
                    </div>
                    <span className="border border-line-strong bg-cream px-2.5 py-1 font-mono text-xs font-bold text-ink">
                      {prefs.pushToTalkShortcut}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-line">
                    <div>
                      <div className="text-xs font-bold text-ink">Auto-restart on Silence</div>
                      <div className="text-[11px] text-ink-soft">Maintain continuous speech recognition</div>
                    </div>
                    <button
                      onClick={() => updatePref('autoRestartOnSilence', !prefs.autoRestartOnSilence)}
                      className={`h-6 w-11 rounded-full p-0.5 border border-line-strong transition-colors ${
                        prefs.autoRestartOnSilence ? 'bg-olive' : 'bg-ink-soft/30'
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full bg-cream transition-transform ${
                          prefs.autoRestartOnSilence ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* PLAYBACK DOMAIN */}
              <div className="border border-line-strong bg-surface p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-line pb-2">
                  <Volume2 size={18} className="text-mustard-deep" />
                  <h2 className="font-display text-xs font-bold uppercase tracking-widest text-ink">
                    PLAYBACK & TTS
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-ink">Auto-Read Summaries</div>
                      <div className="text-[11px] text-ink-soft">Automatically speak generated summaries</div>
                    </div>
                    <button
                      onClick={() => updatePref('autoReadSummaries', !prefs.autoReadSummaries)}
                      className={`h-6 w-11 rounded-full p-0.5 border border-line-strong transition-colors ${
                        prefs.autoReadSummaries ? 'bg-olive' : 'bg-ink-soft/30'
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full bg-cream transition-transform ${
                          prefs.autoReadSummaries ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-line space-y-2">
                    <div className="text-xs font-bold text-ink">Playback Speed Segmented Control</div>
                    <div className="flex gap-2">
                      {[1.0, 1.25, 1.5].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => updatePref('playbackSpeed', speed as 1.0 | 1.25 | 1.5)}
                          className={`flex-1 border border-line-strong py-1.5 text-xs font-bold transition-all ${
                            prefs.playbackSpeed === speed
                              ? 'bg-mustard text-ink font-extrabold shadow-flat'
                              : 'bg-cream text-ink-soft hover:bg-ink hover:text-cream'
                          }`}
                        >
                          {speed}×
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* MODEL DOMAIN */}
              <div className="border border-line-strong bg-surface p-5 space-y-3">
                <div className="flex items-center gap-2 border-b border-line pb-2">
                  <Sparkles size={18} className="text-mustard-deep" />
                  <h2 className="font-display text-xs font-bold uppercase tracking-widest text-ink">
                    ACTIVE MODEL
                  </h2>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-ink">Groq LPU Inference Model</div>
                  <div className="font-mono text-xs text-mustard-deep font-semibold">{prefs.activeModel}</div>
                  <p className="text-[11px] text-ink-soft pt-1">
                    Powered by Groq's low-latency LPU hardware with zero server-side latency for voice synthesis.
                  </p>
                </div>
              </div>

              {/* BACKEND SERVER DOMAIN */}
              <div className="border border-line-strong bg-surface p-5 space-y-3">
                <div className="flex items-center gap-2 border-b border-line pb-2">
                  <Server size={18} className="text-mustard-deep" />
                  <h2 className="font-display text-xs font-bold uppercase tracking-widest text-ink">
                    BACKEND API ENDPOINT
                  </h2>
                </div>

                <div className="space-y-2">
                  <label htmlFor="backend-url" className="text-xs font-bold text-ink">
                    Vercel / Local Host URL
                  </label>
                  <input
                    id="backend-url"
                    type="text"
                    className="w-full border border-line-strong bg-cream px-3 py-1.5 font-mono text-xs text-ink outline-none focus:border-2 focus:border-mustard-deep"
                    value={backendBaseUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    onBlur={() => void setBackendBaseUrl(backendBaseUrl)}
                    placeholder="http://localhost:3001"
                  />
                  <p className="text-[11px] text-ink-soft">
                    All secret Tavily and Groq keys live exclusively in your backend environment variables.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: ONBOARDING FLOW */}
        {activeTab === 'onboarding' && (
          <section className="max-w-2xl mx-auto border border-line-strong bg-surface p-8 space-y-6 shadow-flat">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <span className="font-display text-xs font-extrabold uppercase tracking-widest text-mustard-deep">
                STEP {onboardingStep} OF 3
              </span>
              <div className="flex gap-2">
                {[1, 2, 3].map((st) => (
                  <span
                    key={st}
                    className={`h-2.5 w-2.5 border border-line-strong ${
                      onboardingStep === st ? 'bg-mustard' : 'bg-cream'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* SCREEN 1: WELCOME */}
            {onboardingStep === 1 && (
              <div className="space-y-4 py-2">
                <h1 className="font-display text-2xl font-bold uppercase leading-tight text-ink">
                  Welcome to UrPilot
                </h1>
                <p className="text-sm text-ink-soft leading-relaxed">
                  UrPilot is a high-speed hands-free browsing assistant that lets you open tabs, search the open web, extract page content, and hear summaries using plain spoken voice commands.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-bold uppercase">
                  <div className="border border-line-strong bg-cream p-3">1. Speak</div>
                  <div className="border border-line-strong bg-cream p-3">2. Navigate</div>
                  <div className="border border-line-strong bg-cream p-3">3. Summarize</div>
                </div>

                <button
                  onClick={() => setOnboardingStep(2)}
                  className="mt-4 flex w-full items-center justify-center gap-2 border border-line-strong bg-mustard py-3 text-xs font-bold uppercase text-ink hover:bg-mustard-deep shadow-flat"
                >
                  Get Started <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* SCREEN 2: MIC PERMISSION */}
            {onboardingStep === 2 && (
              <div className="space-y-4 py-2">
                <h1 className="font-display text-xl font-bold uppercase text-ink">
                  Grant Microphone Access
                </h1>
                <p className="text-sm text-ink-soft leading-relaxed">
                  UrPilot listens strictly when you press <kbd className="border border-line-strong bg-cream px-1.5 py-0.5 font-mono text-xs font-bold">Ctrl+Shift+L</kbd> or tap the mic button. It never records audio in the background or transmits raw audio to third parties.
                </p>
                <div className="border border-line-strong bg-cream p-4 flex items-center gap-3">
                  <ShieldCheck size={24} className="text-olive flex-shrink-0" />
                  <div className="text-xs text-ink">
                    Microphone permission runs locally inside the browser's Speech Recognition engine.
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="border border-line-strong bg-cream px-4 py-2.5 text-xs font-bold uppercase text-ink hover:bg-ink hover:text-cream"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setOnboardingStep(3)}
                    className="flex-1 flex items-center justify-center gap-2 border border-line-strong bg-mustard py-2.5 text-xs font-bold uppercase text-ink hover:bg-mustard-deep shadow-flat"
                  >
                    Grant Permission & Next <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 3: ADD FIRST LINK */}
            {onboardingStep === 3 && (
              <div className="space-y-4 py-2">
                <h1 className="font-display text-xl font-bold uppercase text-ink">
                  Add Your First Saved Link
                </h1>
                <p className="text-sm text-ink-soft">
                  Enter a site you open daily (e.g. GitHub or docs) to test "open my stuff".
                </p>

                <div className="space-y-3 border border-line-strong bg-cream p-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-ink mb-1">Site Label</label>
                    <input
                      type="text"
                      className="w-full border border-line-strong bg-surface px-3 py-1.5 text-xs text-ink outline-none"
                      placeholder="e.g. GitHub Dashboard"
                      value={newFirstLinkLabel}
                      onChange={(e) => setNewFirstLinkLabel(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-ink mb-1">URL</label>
                    <input
                      type="text"
                      className="w-full border border-line-strong bg-surface px-3 py-1.5 font-mono text-xs text-ink outline-none"
                      placeholder="https://github.com"
                      value={newFirstLinkUrl}
                      onChange={(e) => setNewFirstLinkUrl(e.target.value)}
                    />
                  </div>
                </div>

                {onboardingSuccess ? (
                  <div className="border border-line-strong bg-olive p-4 text-center text-xs font-bold text-cream uppercase">
                    ✓ Setup Complete! Click side panel mic to start.
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      if (newFirstLinkLabel.trim() && newFirstLinkUrl.trim()) {
                        await persistLinks([
                          ...savedLinks,
                          {
                            id: crypto.randomUUID(),
                            label: newFirstLinkLabel.trim(),
                            url: newFirstLinkUrl.trim(),
                            order: savedLinks.length,
                          },
                        ]);
                      }
                      setOnboardingSuccess(true);
                      setTimeout(() => setActiveTab('links'), 1500);
                    }}
                    className="flex w-full items-center justify-center gap-2 border border-line-strong bg-mustard py-3 text-xs font-bold uppercase text-ink hover:bg-mustard-deep shadow-flat"
                  >
                    Finish Setup & Start Browsing
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<OptionsPage />);
