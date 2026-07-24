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

function normalizeTranscript(raw: string): string {
  let cleaned = raw.trim().replace(/[?.!,;:]+$/g, '').toLowerCase().replace(/\s+/g, ' ');

  // STT Homophone fixes for "pause video" / "pause media"
  cleaned = cleaned.replace(/\b(porn|pose|post|plus|press|cause|pass|paas|paws|paus)\s+(video|media|audio|playback|song|movie)\b/gi, 'pause $2');
  cleaned = cleaned.replace(/\b(porn|pose|post|plus|press|cause|pass|paas|paws)\b/gi, (m) => (raw.toLowerCase().includes('video') || raw.toLowerCase().includes('media') ? 'pause' : m));

  // STT Homophone fixes for "github"
  // Common STT mishearings: "get her", "the gift", "git hub", "gitter", "get hub", "git up"
  const githubHomophones = /\b(the gift|git hub|git thub|get hub|give hub|git-hub|get her|gitter|git up|get up|git huh|get huh|get heard)\b/gi;
  cleaned = cleaned.replace(githubHomophones, 'github');

  // Full-phrase fixes for common "go to / switch to / open" + github mishearings
  cleaned = cleaned.replace(/\b(go to|switch to|open|move to|jump to)\s+(the gift|get her|gitter|git up|get up)\b/gi, '$1 github');

  return cleaned;
}

export function parseCommand(transcript: string, templates: SiteTemplate[]): CommandIntent {
  const lower = normalizeTranscript(transcript);

  if (/^(stop|stop talking|cancel)$/i.test(lower)) {
    return { intent: 'STOP' };
  }

  // TTS / Speech controls (Pause, Resume/Continue, Start Over)
  if (/^(pause|pause reading|pause speech|pause audio)$/i.test(lower)) {
    return { intent: 'TTS_CONTROL', action: 'pause' };
  }
  if (/^(continue|resume|continue reading|resume reading)$/i.test(lower)) {
    return { intent: 'TTS_CONTROL', action: 'continue' };
  }
  if (/^(start|start over|read again|restart|start reading)$/i.test(lower)) {
    return { intent: 'TTS_CONTROL', action: 'start' };
  }
  if (/^(read page aloud|read aloud this page|read page|read aloud|read article aloud)$/i.test(lower)) {
    return { intent: 'READ_PAGE_ALOUD' };
  }

  // Reader Mode
  if (/^(clean view|reader mode|toggle reader mode|open reader mode)$/i.test(lower)) {
    return { intent: 'TOGGLE_READER_MODE' };
  }

  // Tab Management
  if (/^(?:open (?:a )?new tab|new tab|open (?:a )?blank tab|blank tab|create (?:a )?(?:new )?tab)$/i.test(lower)) {
    return { intent: 'NEW_TAB' };
  }
  if (/^(?:close|exit|delete|remove)(?: the| this| current| active)?(?: tab)?$/i.test(lower) && !/close (?:all|other|duplicate)/i.test(lower)) {
    return { intent: 'CLOSE_ACTIVE_TAB' };
  }
  if (/^close (?:all |the )?(?:other |others )?tabs?(?: except (?:this|current)(?: tab)?)?$/i.test(lower) || /^(close other tabs|close others)$/i.test(lower)) {
    return { intent: 'CLOSE_OTHER_TABS' };
  }
  if (/^close (?:all |the )?(?:duplicate|duplicated) tabs?$/i.test(lower) || /^(?:close|remove|delete) (?:the )?duplicates?$/i.test(lower)) {
    return { intent: 'CLOSE_DUPLICATE_TABS' };
  }

  // Numbered & Named Tab Switching (e.g. "open tab no 3", "move to 3rd tab", "switch to tab 2")
  const numTab = parseTabNumber(lower);
  if (numTab !== null && /^(?:open|move to|switch to|go to|select|jump to)?\s*(?:the\s+)?(?:tab\s+(?:no\.?|number\s+)?\S+|\S+\s+tab)$/i.test(lower)) {
    return { intent: 'SWITCH_TO_TAB', tabIndex: numTab };
  }
  if (/^(?:next tab|go to next tab|switch to next tab|tab right)$/i.test(lower)) {
    return { intent: 'NAVIGATE_TAB_DIR', direction: 'next' };
  }
  if (/^(?:previous tab|prev tab|go to previous tab|switch to previous tab|tab left)$/i.test(lower)) {
    return { intent: 'NAVIGATE_TAB_DIR', direction: 'prev' };
  }
  const switchTitleMatch = lower.match(/^(?:switch to|go to|jump to|open tab)\s+(?:the\s+)?(.+?)(?:\s+tab)?$/i);
  if (switchTitleMatch?.[1] && !/^(?:next|prev|previous|first|second|third|fourth|fifth|\d+)$/i.test(switchTitleMatch[1])) {
    return { intent: 'SWITCH_TO_TAB_TITLE', target: switchTitleMatch[1] };
  }

  if (/^mute (?:all |the )?(?:other |others )?tabs?$/i.test(lower)) {
    return { intent: 'MUTE_OTHER_TABS' };
  }
  if (/^mute (?:the |this |current )?tab$/i.test(lower)) {
    return { intent: 'MUTE_TAB' };
  }
  const muteMatch = lower.match(/^mute (?:the )?(.+?)(?: tab)?$/i);
  if (muteMatch?.[1]) {
    return { intent: 'MUTE_TAB', target: muteMatch[1] };
  }
  if (/^unmute (?:the |this |current )?tab$/i.test(lower)) {
    return { intent: 'UNMUTE_TAB' };
  }
  const unmuteMatch = lower.match(/^unmute (?:the )?(.+?)(?: tab)?$/i);
  if (unmuteMatch?.[1]) {
    return { intent: 'UNMUTE_TAB', target: unmuteMatch[1] };
  }
  if (/^(?:pin|pin tab|pin this tab|pin the tab|pin current tab)$/i.test(lower)) {
    return { intent: 'PIN_TAB' };
  }
  const pinMatch = lower.match(/^pin (?:the )?(.+?)(?: tab)?$/i);
  if (pinMatch?.[1]) {
    return { intent: 'PIN_TAB', target: pinMatch[1] };
  }
  if (/^(?:unpin|un-pin|on-pin|on pin)(?: this| current| the)?(?: tab)?$/i.test(lower)) {
    return { intent: 'UNPIN_TAB' };
  }
  const unpinMatch = lower.match(/^(?:unpin|un-pin|on-pin|on pin) (?:the )?(.+?)(?: tab)?$/i);
  if (unpinMatch?.[1]) {
    return { intent: 'UNPIN_TAB', target: unpinMatch[1] };
  }
  if (/^(?:reopen|re-open|undo close)(?: closed| the closed)? tab$/i.test(lower)) {
    return { intent: 'REOPEN_CLOSED_TAB' };
  }
  if (/^(?:group|cluster) tabs?(?: by domain| by site)?$/i.test(lower)) {
    return { intent: 'GROUP_TABS_BY_DOMAIN' };
  }

  // Media & Video Controls
  if (/^(?:pause|pause video|pause audio|pause media)$/i.test(lower)) {
    return { intent: 'MEDIA_CONTROL', action: 'pause' };
  }
  if (/^(?:play|play video|play audio|play media)$/i.test(lower)) {
    return { intent: 'MEDIA_CONTROL', action: 'play' };
  }
  if (/^(?:stop video|stop audio|stop media)$/i.test(lower)) {
    return { intent: 'MEDIA_CONTROL', action: 'stop' };
  }
  if (/^(?:mute video|mute audio|mute media)$/i.test(lower)) {
    return { intent: 'MEDIA_CONTROL', action: 'mute' };
  }
  if (/^(?:unmute video|unmute audio|unmute media)$/i.test(lower)) {
    return { intent: 'MEDIA_CONTROL', action: 'unmute' };
  }
  if (/^(?:speed up 2x|2x speed|set speed (?:to )?2x|speed 2x|2x)$/i.test(lower)) {
    return { intent: 'MEDIA_CONTROL', action: 'speed', rate: 2.0 };
  }
  if (/^(?:speed up 1\.5x|1\.5x speed|set speed (?:to )?1\.5x|speed 1\.5x|1\.5x)$/i.test(lower)) {
    return { intent: 'MEDIA_CONTROL', action: 'speed', rate: 1.5 };
  }
  if (/^(?:normal speed|1x speed|set speed (?:to )?1x|reset speed|speed 1x|1x)$/i.test(lower)) {
    return { intent: 'MEDIA_CONTROL', action: 'speed', rate: 1.0 };
  }

  // Quick Clipboard & Utilities
  if (/^(copy url|copy page link|copy link)$/.test(lower)) {
    return { intent: 'COPY_TO_CLIPBOARD', target: 'url' };
  }
  if (/^(copy page title|copy title)$/.test(lower)) {
    return { intent: 'COPY_TO_CLIPBOARD', target: 'title' };
  }
  if (/^(take screenshot|screenshot page|capture screen|screenshot)$/.test(lower)) {
    return { intent: 'TAKE_SCREENSHOT' };
  }
  if (/^(scroll down|page down)$/.test(lower)) {
    return { intent: 'SCROLL_PAGE', direction: 'down' };
  }
  if (/^(scroll up|page up)$/.test(lower)) {
    return { intent: 'SCROLL_PAGE', direction: 'up' };
  }
  if (/^(scroll to top|top of page)$/.test(lower)) {
    return { intent: 'SCROLL_PAGE', direction: 'top' };
  }
  if (/^(scroll to bottom|bottom of page)$/.test(lower)) {
    return { intent: 'SCROLL_PAGE', direction: 'bottom' };
  }
  const highlightMatch = lower.match(/^highlight (.+?)(?: on page)?$/);
  if (highlightMatch?.[1]) {
    return { intent: 'HIGHLIGHT_KEYWORD', keyword: highlightMatch[1] };
  }

  // Timers & Reminders
  const timerMatch = lower.match(/^set (?:a )?timer for (\d+)\s*(?:minute|minutes|min|mins)$/);
  if (timerMatch?.[1]) {
    return { intent: 'SET_TIMER', minutes: parseInt(timerMatch[1], 10) };
  }
  const reminderMatch = lower.match(/^remind me in (\d+)\s*(?:minute|minutes|min|mins) to (.+)$/);
  if (reminderMatch?.[1] && reminderMatch[2]) {
    return { intent: 'SET_REMINDER', minutes: parseInt(reminderMatch[1], 10), message: reminderMatch[2] };
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
    const match = lower.match(openSite) ?? lower.match(searchOnSite);

    if (match?.[1]) {
      return { intent: 'SITE_SEARCH', site: template.site, query: cleanQuery(match[1]) };
    }
  }

  const naturalSiteMatch = lower.match(/^search\s+(.+)\s+on\s+(.+)$/i);
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

  return { intent: 'UNKNOWN', transcript: lower };
}

function cleanQuery(query: string) {
  return query.trim().replace(/[?.!]$/, '');
}

function parseTabNumber(text: string): number | null {
  const numberMap: Record<string, number> = {
    one: 1, '1st': 1, first: 1, '1': 1,
    two: 2, '2nd': 2, second: 2, '2': 2,
    three: 3, '3rd': 3, third: 3, '3': 3,
    four: 4, '4th': 4, fourth: 4, '4': 4,
    five: 5, '5th': 5, fifth: 5, '5': 5,
    six: 6, '6th': 6, sixth: 6, '6': 6,
    seven: 7, '7th': 7, seventh: 7, '7': 7,
    eight: 8, '8th': 8, eighth: 8, '8': 8,
    nine: 9, '9th': 9, ninth: 9, '9': 9,
    ten: 10, '10th': 10, tenth: 10, '10': 10,
  };
  const match = text.match(/\b(10th|[1-9]st|[1-9]nd|[1-9]rd|[1-9]th|\d+|one|two|three|four|five|six|seven|eight|nine|ten|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\b/i);
  if (match?.[1]) {
    const key = match[1].toLowerCase();
    if (numberMap[key]) return numberMap[key];
    const parsed = parseInt(key, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return null;
}
