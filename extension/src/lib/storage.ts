import { defaultSiteTemplates } from './siteTemplates';
import type { SavedLink, SiteTemplate } from './types';

type StorageShape = {
  savedLinks: SavedLink[];
  siteTemplates: SiteTemplate[];
  backendBaseUrl: string;
};

const defaultBackendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:3001';

export async function getSettings(): Promise<StorageShape> {
  const values = await chrome.storage.sync.get({
    savedLinks: [],
    siteTemplates: defaultSiteTemplates,
    backendBaseUrl: defaultBackendBaseUrl
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
