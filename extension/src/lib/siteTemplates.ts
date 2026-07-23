import type { SiteTemplate } from './types';

export const defaultSiteTemplates: SiteTemplate[] = [
  { id: 'wikipedia', site: 'Wikipedia', urlTemplate: 'https://en.wikipedia.org/w/index.php?search={q}' },
  { id: 'youtube', site: 'YouTube', urlTemplate: 'https://www.youtube.com/results?search_query={q}' },
  { id: 'github', site: 'GitHub', urlTemplate: 'https://github.com/search?q={q}' },
  { id: 'google', site: 'Google', urlTemplate: 'https://www.google.com/search?q={q}' },
  { id: 'amazon', site: 'Amazon', urlTemplate: 'https://www.amazon.com/s?k={q}' },
  { id: 'reddit', site: 'Reddit', urlTemplate: 'https://www.reddit.com/search/?q={q}' },
  { id: 'stack-overflow', site: 'Stack Overflow', urlTemplate: 'https://stackoverflow.com/search?q={q}' },
  { id: 'imdb', site: 'IMDb', urlTemplate: 'https://www.imdb.com/find/?q={q}' },
  { id: 'x', site: 'X', urlTemplate: 'https://x.com/search?q={q}' },
  { id: 'npm', site: 'npm', urlTemplate: 'https://www.npmjs.com/search?q={q}' }
];

export function findTemplate(templates: SiteTemplate[], spokenSite: string) {
  const normalized = normalizeSite(spokenSite);
  return templates.find((template) => normalizeSite(template.site) === normalized);
}

export function buildSiteSearchUrl(template: SiteTemplate, query: string) {
  return template.urlTemplate.replace('{q}', encodeURIComponent(query));
}

function normalizeSite(site: string) {
  return site.toLowerCase().replace(/[^a-z0-9]/g, '');
}
