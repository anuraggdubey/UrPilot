import type { CommandIntent, SiteTemplate } from '../lib/types';
import { findTemplate } from '../lib/siteTemplates';

export function parseCommand(transcript: string, templates: SiteTemplate[]): CommandIntent {
  const text = transcript.trim().replace(/\s+/g, ' ');
  const lower = text.toLowerCase();

  if (/^(stop|stop talking|cancel)$/.test(lower)) {
    return { intent: 'STOP' };
  }

  if (/^(open my stuff|open my requirements|open my links)\b/.test(lower)) {
    return { intent: 'OPEN_SAVED_LINKS' };
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
