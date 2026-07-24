import { defaultSiteTemplates } from './siteTemplates';
import type { SavedLink, SiteTemplate, UserPreferences } from './types';

export const defaultPreferences: UserPreferences = {
  autoRestartOnSilence: true,
  autoReadSummaries: false,
  playbackSpeed: 1.0,
  activeModel: 'Groq (llama-3.3-70b-versatile)',
  pushToTalkShortcut: 'Ctrl+Shift+L',
};

type StorageShape = {
  savedLinks: SavedLink[];
  siteTemplates: SiteTemplate[];
  backendBaseUrl: string;
  userPreferences: UserPreferences;
};

const defaultBackendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:3001';

export async function getSettings(): Promise<StorageShape> {
  const values = await chrome.storage.sync.get({
    savedLinks: [
      { id: '1', label: 'GitHub', url: 'https://github.com', order: 0 },
      { id: '2', label: 'Stellar Docs', url: 'https://developers.stellar.org/docs', order: 1 },
      { id: '3', label: 'Figma', url: 'https://figma.com', order: 2 },
    ],
    siteTemplates: defaultSiteTemplates,
    backendBaseUrl: defaultBackendBaseUrl,
    userPreferences: defaultPreferences,
  });

  return values as StorageShape;
}

export async function setSavedLinks(savedLinks: SavedLink[]) {
  await chrome.storage.sync.set({ savedLinks });
}

export async function setSiteTemplates(siteTemplates: SiteTemplate[]) {
  await chrome.storage.sync.set({ siteTemplates });
}

export async function setBackendBaseUrl(backendBaseUrl: string) {
  await chrome.storage.sync.set({ backendBaseUrl });
}

export async function setUserPreferences(userPreferences: Partial<UserPreferences>) {
  const current = await getSettings();
  const next = { ...current.userPreferences, ...userPreferences };
  await chrome.storage.sync.set({ userPreferences: next });
}
