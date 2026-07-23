import type { CommandIntent, SiteTemplate } from '../lib/types';
import { findTemplate } from '../lib/siteTemplates';

const POPULAR_APPS: Record<string, { label: string; url: string }> = {
  whatsapp: { label: 'WhatsApp Web', url: 'https://web.whatsapp.com' },
  'whatsapp web': { label: 'WhatsApp Web', url: 'https://web.whatsapp.com' },
  youtube: { label: 'YouTube', url: 'https://www.youtube.com' },
  github: { label: 'GitHub', url: 'https://github.com' },
  gmail: { label: 'Gmail', url: 'https://mail.google.com' },
  chatgpt: { label: 'ChatGPT', url: 'https://chatgpt.com' },
  google: { label: 'Google Search', url: 'https://www.google.com' },
  twitter: { label: 'X (Twitter)', url: 'https://x.com' },
  x: { label: 'X', url: 'https://x.com' },
  reddit: { label: 'Reddit', url: 'https://www.reddit.com' },
  instagram: { label: 'Instagram', url: 'https://www.instagram.com' },
  facebook: { label: 'Facebook', url: 'https://www.facebook.com' },
  linkedin: { label: 'LinkedIn', url: 'https://www.linkedin.com' },
  netflix: { label: 'Netflix', url: 'https://www.netflix.com' },
  spotify: { label: 'Spotify', url: 'https://open.spotify.com' },
  amazon: { label: 'Amazon', url: 'https://www.amazon.com' },
  wikipedia: { label: 'Wikipedia', url: 'https://www.wikipedia.org' }
};

export function parseCommand(transcript: string, templates: SiteTemplate[]): CommandIntent {
  const text = transcript.trim().replace(/\s+/g, ' ');
  const lower = text.toLowerCase();

  if (/^(stop|stop talking|cancel)$/.test(lower)) {
    return { intent: 'STOP' };
  }

  if (/^(open my stuff|open my requirements|open my links)\b/.test(lower)) {
    return { intent: 'OPEN_SAVED_LINKS' };
  }

  // Direct app launcher matching (e.g., "open whatsapp", "whatsapp", "open youtube")
  const openAppMatch = lower.match(/^(?:open\s+|go to\s+)?([a-z0-9\s.]+?)$/);
  const targetKey = openAppMatch?.[1]?.trim();
  if (targetKey && POPULAR_APPS[targetKey]) {
    const app = POPULAR_APPS[targetKey];
    return { intent: 'OPEN_DIRECT_URL', label: app.label, url: app.url };
  }

  // Direct domain URL (e.g. "open github.com")
  const domainMatch = lower.match(/^(?:open\s+|go to\s+)?([a-z0-9-]+\.(?:com|org|io|net|dev|ai|app))$/);
  if (domainMatch?.[1]) {
    return { intent: 'OPEN_DIRECT_URL', label: domainMatch[1], url: `https://${domainMatch[1]}` };
  }

  if (/^(summari[sz]e|read|explain)( this page| this)?$/.test(lower)) {
    return { intent: 'SUMMARIZE_PAGE' };
  }

  const chained = lower.match(/^(?:search|find|look up|google)\s+(.+?)\s+and\s+(?:summari[sz]e|explain|read)\s+it$/);
  if (chained?.[1]) {
    return { intent: 'WEB_SEARCH_THEN_SUMMARIZE', query: cleanQuery(chained[1]) };
  }

  for (const template of templates) {
    const siteName = template.site.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const openSite = new RegExp(`^open\\s+${siteName}\\s+and\\s+search\\s+(.+)$`, 'i');
    const searchOnSite = new RegExp(`^search\\s+(.+)\\s+on\\s+${siteName}$`, 'i');
    const match = text.match(openSite) ?? text.match(searchOnSite);

    if (match?.[1]) {
      return { intent: 'SITE_SEARCH', site: template.site, query: cleanQuery(match[1]) };
    }
  }

  const naturalSiteMatch = text.match(/^search\s+(.+)\s+on\s+(.+)$/i);
  if (naturalSiteMatch?.[1] && naturalSiteMatch[2] && findTemplate(templates, naturalSiteMatch[2])) {
    return {
      intent: 'SITE_SEARCH',
      site: naturalSiteMatch[2],
      query: cleanQuery(naturalSiteMatch[1])
    };
  }

  const webSearch = lower.match(/^(?:search|find|look up|google)\s+(.+)$/);
  if (webSearch?.[1]) {
    return { intent: 'WEB_SEARCH', query: cleanQuery(webSearch[1]) };
  }

  return { intent: 'UNKNOWN', transcript: text };
}

function cleanQuery(query: string) {
  return query.trim().replace(/[?.!]$/, '');
}
