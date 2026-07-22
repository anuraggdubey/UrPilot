import React from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Trash2 } from 'lucide-react';
import '../styles.css';
import { getSettings, setBackendBaseUrl, setSavedLinks, setSiteTemplates } from '../lib/storage';
import type { SavedLink, SiteTemplate } from '../lib/types';

function OptionsPage() {
  const [savedLinks, setLinks] = React.useState<SavedLink[]>([]);
  const [templates, setTemplates] = React.useState<SiteTemplate[]>([]);
  const [backendBaseUrl, setBackendUrl] = React.useState('');

  React.useEffect(() => {
    void getSettings().then((settings) => {
      setLinks(settings.savedLinks);
      setTemplates(settings.siteTemplates);
      setBackendUrl(settings.backendBaseUrl);
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

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-6 text-ink">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">UrPilot Options</h1>
          <p className="mt-1 text-sm text-slate-600">Saved links, site search templates, and backend connection.</p>
        </header>

        <section className="rounded-md border border-mist bg-white p-4">
          <h2 className="text-base font-semibold">Backend</h2>
          <input
            className="mt-3 w-full rounded-md border border-mist px-3 py-2 text-sm outline-none focus:border-moss"
            value={backendBaseUrl}
            onChange={(event) => setBackendUrl(event.target.value)}
            onBlur={() => setBackendBaseUrl(backendBaseUrl)}
            placeholder="http://localhost:3001"
          />
        </section>

        <section className="rounded-md border border-mist bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Saved Links</h2>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-moss px-3 py-2 text-sm font-medium text-white"
              onClick={() =>
                persistLinks([
                  ...savedLinks,
                  { id: crypto.randomUUID(), label: 'New Link', url: 'https://example.com', order: savedLinks.length }
                ])
              }
            >
              <Plus size={16} />
              Add
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {savedLinks.map((link, index) => (
              <div className="grid grid-cols-[1fr_2fr_auto] gap-2" key={link.id}>
                <input
                  className="rounded-md border border-mist px-3 py-2 text-sm"
                  value={link.label}
                  onChange={(event) => {
                    const next = savedLinks.map((item) => (item.id === link.id ? { ...item, label: event.target.value } : item));
                    void persistLinks(next);
                  }}
                />
                <input
                  className="rounded-md border border-mist px-3 py-2 text-sm"
                  value={link.url}
                  onChange={(event) => {
                    const next = savedLinks.map((item) =>
                      item.id === link.id ? { ...item, url: event.target.value, order: index } : item
                    );
                    void persistLinks(next);
                  }}
                />
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-mist"
                  title="Remove link"
                  onClick={() => persistLinks(savedLinks.filter((item) => item.id !== link.id))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-mist bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Site Search Templates</h2>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-moss px-3 py-2 text-sm font-medium text-white"
              onClick={() =>
                persistTemplates([
                  ...templates,
                  { id: crypto.randomUUID(), site: 'New Site', urlTemplate: 'https://example.com/search?q={q}' }
                ])
              }
            >
              <Plus size={16} />
              Add
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {templates.map((template) => (
              <div className="grid grid-cols-[1fr_2fr_auto] gap-2" key={template.id}>
                <input
                  className="rounded-md border border-mist px-3 py-2 text-sm"
                  value={template.site}
                  onChange={(event) => {
                    const next = templates.map((item) => (item.id === template.id ? { ...item, site: event.target.value } : item));
                    void persistTemplates(next);
                  }}
                />
                <input
                  className="rounded-md border border-mist px-3 py-2 text-sm"
                  value={template.urlTemplate}
                  onChange={(event) => {
                    const next = templates.map((item) =>
                      item.id === template.id ? { ...item, urlTemplate: event.target.value } : item
                    );
                    void persistTemplates(next);
                  }}
                />
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-mist"
                  title="Remove template"
                  onClick={() => persistTemplates(templates.filter((item) => item.id !== template.id))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<OptionsPage />);
