import { describe, expect, it } from 'vitest';
import { parseCommand } from './commandRouter';
import { defaultSiteTemplates } from '../lib/siteTemplates';

describe('parseCommand', () => {
  it.each([
    ['open my stuff', { intent: 'OPEN_SAVED_LINKS' }],
    ['open my requirements', { intent: 'OPEN_SAVED_LINKS' }],
    ['stop talking', { intent: 'STOP' }],
    ['summarize this page', { intent: 'SUMMARIZE_PAGE' }],
    ['read this', { intent: 'SUMMARIZE_PAGE' }],
    ['close this tab', { intent: 'CLOSE_ACTIVE_TAB' }],
    ['close tab', { intent: 'CLOSE_ACTIVE_TAB' }],
    ['open tab no 3', { intent: 'SWITCH_TO_TAB', tabIndex: 3 }],
    ['move to 3rd tab', { intent: 'SWITCH_TO_TAB', tabIndex: 3 }],
    ['switch to tab 2', { intent: 'SWITCH_TO_TAB', tabIndex: 2 }],
    ['next tab', { intent: 'NAVIGATE_TAB_DIR', direction: 'next' }],
    ['close all tabs except this', { intent: 'CLOSE_OTHER_TABS' }],
    ['close duplicate tabs', { intent: 'CLOSE_DUPLICATE_TABS' }],
    ['close the duplicate tabs', { intent: 'CLOSE_DUPLICATE_TABS' }],
    ['close duplicates', { intent: 'CLOSE_DUPLICATE_TABS' }],
    ['mute other tabs', { intent: 'MUTE_OTHER_TABS' }],
    ['mute meet tab', { intent: 'MUTE_TAB', target: 'meet' }],
    ['unmute tab', { intent: 'UNMUTE_TAB' }],
    ['pin this tab', { intent: 'PIN_TAB' }],
    ['unpin tab', { intent: 'UNPIN_TAB' }],
    ['unpin this tab', { intent: 'UNPIN_TAB' }],
    ['un-pin this tab', { intent: 'UNPIN_TAB' }],
    ['reopen closed tab', { intent: 'REOPEN_CLOSED_TAB' }],
    ['group tabs by domain', { intent: 'GROUP_TABS_BY_DOMAIN' }],
    ['pause video', { intent: 'MEDIA_CONTROL', action: 'pause' }],
    ['play video', { intent: 'MEDIA_CONTROL', action: 'play' }],
    ['play', { intent: 'MEDIA_CONTROL', action: 'play' }],
    ['speed up 2x', { intent: 'MEDIA_CONTROL', action: 'speed', rate: 2.0 }],
    ['normal speed', { intent: 'MEDIA_CONTROL', action: 'speed', rate: 1.0 }],
    ['read page aloud', { intent: 'READ_PAGE_ALOUD' }],
    ['pause', { intent: 'TTS_CONTROL', action: 'pause' }],
    ['continue', { intent: 'TTS_CONTROL', action: 'continue' }],
    ['start', { intent: 'TTS_CONTROL', action: 'start' }],
    ['clean view', { intent: 'TOGGLE_READER_MODE' }],
    ['copy url', { intent: 'COPY_TO_CLIPBOARD', target: 'url' }],
    ['take screenshot', { intent: 'TAKE_SCREENSHOT' }],
    ['scroll down', { intent: 'SCROLL_PAGE', direction: 'down' }],
    ['highlight stellar on page', { intent: 'HIGHLIGHT_KEYWORD', keyword: 'stellar' }],
    ['set a timer for 15 minutes', { intent: 'SET_TIMER', minutes: 15 }],
    ['remind me in 30 minutes to take a break', { intent: 'SET_REMINDER', minutes: 30, message: 'take a break' }]
  ])('parses %s', (transcript, expected) => {
    expect(parseCommand(transcript, defaultSiteTemplates)).toMatchObject(expected);
  });

  it('parses site search with open-site phrasing', () => {
    expect(parseCommand('open YouTube and search Stellar smart contracts', defaultSiteTemplates)).toMatchObject({
      intent: 'SITE_SEARCH',
      site: 'YouTube',
      query: 'Stellar smart contracts'
    });
  });

  it('parses site search with search-on-site phrasing', () => {
    expect(parseCommand('search vector databases on GitHub', defaultSiteTemplates)).toMatchObject({
      intent: 'SITE_SEARCH',
      site: 'GitHub',
      query: 'vector databases'
    });
  });

  it('parses chained web search and summarize', () => {
    expect(parseCommand('search Stellar Soroban docs and summarize it', defaultSiteTemplates)).toMatchObject({
      intent: 'WEB_SEARCH_THEN_SUMMARIZE',
      query: 'stellar soroban docs'
    });
  });

  it('parses open web search', () => {
    expect(parseCommand('look up how to deploy a smart contract on Stellar', defaultSiteTemplates)).toMatchObject({
      intent: 'WEB_SEARCH',
      query: 'how to deploy a smart contract on stellar'
    });
  });
});
