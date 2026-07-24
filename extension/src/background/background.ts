import { parseCommand } from './commandRouter';
import { broadcastPanelUpdate, speak, stopSpeaking } from './messageHub';
import { buildSiteSearchUrl, defaultSiteTemplates, findTemplate } from '../lib/siteTemplates';
import { getSettings } from '../lib/storage';
import type { AskPageResponse, ExtensionMessage, PageContent, SearchResponse, SuggestReplyResponse, SummaryResponse } from '../lib/types';

let listening = false;
let activeController: AbortController | undefined;

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => undefined);
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-listening') {
    void toggleListening();
  }
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  handleMessage(message)
    .then((res) => {
      try {
        sendResponse(res ?? { ok: true });
      } catch {
        // Channel closed by sender
      }
    })
    .catch((error) => {
      const errorMsg = error instanceof Error ? error.message : String(error);
      broadcastPanelUpdate({ status: 'Error', error: errorMsg });
      try {
        sendResponse({ ok: false, error: errorMsg });
      } catch {
        // Channel closed
      }
    });

  return true;
});

async function handleMessage(message: ExtensionMessage) {
  switch (message.type) {
    case 'START_LISTENING':
      await startListening();
      return { ok: true };
    case 'STOP_LISTENING':
      await stopListening();
      return { ok: true };
    case 'TOGGLE_LISTENING':
      await toggleListening();
      return { ok: true };
    case 'TRANSCRIPT_INTERIM':
      broadcastPanelUpdate({ status: 'Listening', transcript: message.text, listening: true, error: undefined });
      return { ok: true };
    case 'TRANSCRIPT_FINAL':
    case 'ROUTE_COMMAND':
      broadcastPanelUpdate({ error: undefined });
      await routeTranscript(
        message.type === 'TRANSCRIPT_FINAL' ? message.text : message.transcript,
        message.type === 'TRANSCRIPT_FINAL' ? message.confidence : undefined
      );
      return { ok: true };
    case 'SPEAK':
      speak(message.text);
      return { ok: true };
    case 'STOP_SPEAKING':
      stopCurrentWork();
      return { ok: true };
    default:
      return { ok: false };
  }
}

async function toggleListening() {
  if (listening) {
    await stopListening();
  } else {
    await startListening();
  }
}

async function startListening() {
  await ensureOffscreenDocument();
  listening = true;
  await chrome.runtime.sendMessage({ type: 'START_LISTENING' } satisfies ExtensionMessage);
  broadcastPanelUpdate({ status: 'Listening', listening: true });
}

async function stopListening() {
  listening = false;
  await chrome.runtime.sendMessage({ type: 'STOP_LISTENING' } satisfies ExtensionMessage).catch(() => undefined);
  broadcastPanelUpdate({ status: 'Idle', listening: false });
}

async function ensureOffscreenDocument() {
  const url = chrome.runtime.getURL('src/offscreen/offscreen.html');
  const contexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [url]
  });

  if (contexts.length > 0) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: 'src/offscreen/offscreen.html',
    reasons: [chrome.offscreen.Reason.USER_MEDIA],
    justification: 'UrPilot uses speech recognition to turn voice commands into browser actions.'
  });
}

async function routeTranscript(transcript: string, confidence?: number) {
  const settings = await getSettings();
  let command = parseCommand(transcript, settings.siteTemplates);

  broadcastPanelUpdate({ status: 'Processing speech...', transcript });

  // If command is UNKNOWN or confidence is low, attempt offline Whisper fallback first
  const isLowConfidence = confidence !== undefined && confidence > 0 && confidence < 0.55;
  if (command.intent === 'UNKNOWN' || isLowConfidence) {
    try {
      const fallbackResponse = await chrome.runtime.sendMessage({ type: 'FALLBACK_STT' } satisfies ExtensionMessage)
        .catch(() => null);

      if (fallbackResponse?.text) {
        const fallbackTranscript = fallbackResponse.text.trim();
        const fallbackCommand = parseCommand(fallbackTranscript, settings.siteTemplates);

        if (fallbackCommand.intent !== 'UNKNOWN') {
          command = fallbackCommand;
          transcript = fallbackTranscript;
          broadcastPanelUpdate({ status: 'Resolved via offline Whisper', transcript });
        }
      }
    } catch (fallbackErr) {
      console.warn('Offline fallback STT failed:', fallbackErr);
    }
  }

  if (command.intent === 'UNKNOWN') {
    try {
      broadcastPanelUpdate({ status: 'Understanding query with AI...', transcript });
      const llmResult = await apiFetch<{
        intent: string;
        params: { query?: string; site?: string };
      }>(`${settings.backendBaseUrl}/api/parse-intent`, { transcript });

      if (llmResult.intent && llmResult.intent !== 'UNKNOWN') {
        if (llmResult.intent === 'WEB_SEARCH' && llmResult.params?.query) {
          command = { intent: 'WEB_SEARCH', query: llmResult.params.query };
        } else if (llmResult.intent === 'WEB_SEARCH_THEN_SUMMARIZE' && llmResult.params?.query) {
          command = { intent: 'WEB_SEARCH_THEN_SUMMARIZE', query: llmResult.params.query };
        } else if (llmResult.intent === 'SITE_SEARCH' && llmResult.params?.site && llmResult.params?.query) {
          command = { intent: 'SITE_SEARCH', site: llmResult.params.site, query: llmResult.params.query };
        } else if (llmResult.intent === 'ASK_PAGE_QUESTION' && (llmResult.params as any)?.question) {
          command = { intent: 'ASK_PAGE_QUESTION', question: (llmResult.params as any).question };
        } else if (llmResult.intent === 'SUMMARIZE_PAGE') {
          command = { intent: 'SUMMARIZE_PAGE' };
        } else if (llmResult.intent === 'SUGGEST_REPLY') {
          command = { intent: 'SUGGEST_REPLY' };
        } else if (llmResult.intent === 'OPEN_DIRECT_URL' && (llmResult.params as any)?.url) {
          command = { intent: 'OPEN_DIRECT_URL', label: (llmResult.params as any).label || 'website', url: (llmResult.params as any).url };
        } else if (llmResult.intent === 'OPEN_SAVED_LINKS') {
          command = { intent: 'OPEN_SAVED_LINKS' };
        }
      }
    } catch (err) {
      console.warn('LLM intent parsing failed, falling back:', err);
    }
  }

  switch (command.intent) {
    case 'OPEN_SAVED_LINKS':
      await openSavedLinks();
      break;
    case 'OPEN_DIRECT_URL':
      await openDirectUrl(command.label, command.url);
      break;
    case 'SITE_SEARCH':
      await siteSearch(command.site, command.query);
      break;
    case 'WEB_SEARCH':
      await webSearch(command.query, false);
      break;
    case 'WEB_SEARCH_THEN_SUMMARIZE':
      await webSearch(command.query, true);
      break;
    case 'SUMMARIZE_PAGE':
      await summarizeActivePage('summary');
      break;
    case 'ASK_PAGE_QUESTION':
      await askActivePageQuestion(command.question);
      break;
    case 'SUGGEST_REPLY':
      await suggestReplyForActivePage();
      break;
    case 'NEW_TAB':
      await openNewTab();
      break;
    case 'NAVIGATE_HISTORY':
      await navigateHistory(command.direction);
      break;
    case 'RELOAD_TAB':
      await reloadTab();
      break;
    case 'DUPLICATE_TAB':
      await duplicateActiveTab();
      break;
    case 'NEW_WINDOW':
      await openNewWindow();
      break;
    case 'CLOSE_WINDOW':
      await closeCurrentWindow();
      break;
    case 'ZOOM_PAGE':
      await zoomPage(command.action);
      break;
    case 'BOOKMARK_PAGE':
      await bookmarkActivePage();
      break;
    case 'CLOSE_ACTIVE_TAB':
      await closeActiveTab();
      break;
    case 'CLOSE_OTHER_TABS':
      await closeOtherTabs();
      break;
    case 'CLOSE_DUPLICATE_TABS':
      await closeDuplicateTabs();
      break;
    case 'SWITCH_TO_TAB':
      await switchToTab(command.tabIndex);
      break;
    case 'SWITCH_TO_TAB_TITLE':
      await switchToTabTitle(command.target);
      break;
    case 'NAVIGATE_TAB_DIR':
      await navigateTabDir(command.direction);
      break;
    case 'MUTE_OTHER_TABS':
      await muteOtherTabs();
      break;
    case 'MUTE_TAB':
      await setTabMuted(command.target, true);
      break;
    case 'UNMUTE_TAB':
      await setTabMuted(command.target, false);
      break;
    case 'PIN_TAB':
      await setTabPinned(command.target, true);
      break;
    case 'UNPIN_TAB':
      await setTabPinned(command.target, false);
      break;
    case 'REOPEN_CLOSED_TAB':
      await reopenClosedTab();
      break;
    case 'GROUP_TABS_BY_DOMAIN':
      await groupTabsByDomain();
      break;
    case 'MEDIA_CONTROL':
      await handleMediaControl(command.action, command.rate);
      break;
    case 'READ_PAGE_ALOUD':
      await handleReadPageAloud();
      break;
    case 'TTS_CONTROL':
      handleTTSControl(command.action);
      break;
    case 'TOGGLE_READER_MODE':
      await handleToggleReaderMode();
      break;
    case 'COPY_TO_CLIPBOARD':
      await handleCopyToClipboard(command.target);
      break;
    case 'TAKE_SCREENSHOT':
      await handleTakeScreenshot();
      break;
    case 'SCROLL_PAGE':
      await handleScroll(command.direction);
      break;
    case 'HIGHLIGHT_KEYWORD':
      await handleHighlight(command.keyword);
      break;
    case 'SET_TIMER':
      await handleSetTimer(command.minutes, command.label);
      break;
    case 'SET_REMINDER':
      await handleSetReminder(command.minutes, command.message);
      break;
    case 'STOP':
      stopCurrentWork();
      break;
    case 'UNKNOWN':
      broadcastPanelUpdate({ status: "I couldn't match that command.", transcript });
      speak("Sorry, I didn't catch that command.");
      break;
  }
}

async function askActivePageQuestion(question: string) {
  const tab = await getActiveTab();
  if (!tab?.id) {
    broadcastPanelUpdate({ status: 'No active tab found.' });
    return;
  }

  const { backendBaseUrl } = await getSettings();
  broadcastPanelUpdate({ status: 'Reading page to answer...' });

  const pageContent = await extractContent(tab.id);
  broadcastPanelUpdate({ status: 'Thinking...' });

  const result = await apiFetch<AskPageResponse>(`${backendBaseUrl}/api/ask-page`, {
    ...pageContent,
    question
  });

  broadcastPanelUpdate({
    status: 'Answer ready',
    summary: result.answer,
    spokenSummary: result.spokenAnswer,
    keyPoints: []
  });
  speak(result.spokenAnswer);
}

async function suggestReplyForActivePage() {
  const tab = await getActiveTab();
  if (!tab?.id) {
    broadcastPanelUpdate({ status: 'No active tab found.' });
    return;
  }

  const { backendBaseUrl } = await getSettings();
  broadcastPanelUpdate({ status: 'Reading post for reply ideas...' });

  try {
    const pageContent = await extractContent(tab.id);
    broadcastPanelUpdate({ status: 'Generating reply suggestions with AI...' });

    const result = await apiFetch<SuggestReplyResponse>(`${backendBaseUrl}/api/suggest-reply`, pageContent);

    broadcastPanelUpdate({
      status: 'Reply suggestions ready!',
      replySuggestions: result.suggestions,
      spokenSummary: result.spokenSummary,
      sourceTitle: pageContent.title,
      sourceUrl: pageContent.url
    });
    speak(result.spokenSummary);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    broadcastPanelUpdate({ status: 'Failed to generate replies', error: errorMsg });
    speak('Could not generate reply suggestions for this page.');
  }
}

async function openDirectUrl(label: string, url: string) {
  const tab = await getActiveTab();
  if (tab.id) {
    await chrome.tabs.update(tab.id, { url, active: true });
  } else {
    await chrome.tabs.create({ url, active: true });
  }

  broadcastPanelUpdate({ status: `Opened ${label}` });
  speak(`Opening ${label}`);
}

async function openSavedLinks() {
  const { savedLinks } = await getSettings();
  const orderedLinks = [...savedLinks].sort((a, b) => a.order - b.order);

  if (orderedLinks.length === 0) {
    const statusMsg = 'No saved links yet. Add them in Options.';
    broadcastPanelUpdate({ status: statusMsg });
    speak('No saved links found.');
    return;
  }

  for (const [index, link] of orderedLinks.entries()) {
    await chrome.tabs.create({ url: link.url, active: index === 0 });
  }

  const labels = orderedLinks.map((l) => l.label).filter(Boolean);
  let spokenMsg = `Opened ${orderedLinks.length} saved links.`;

  if (labels.length === 1) {
    spokenMsg = `Opened ${labels[0]}.`;
  } else if (labels.length > 1) {
    const copy = [...labels];
    const last = copy.pop();
    spokenMsg = `Opened ${copy.join(', ')}, and ${last}.`;
  }

  broadcastPanelUpdate({ status: `Opened ${orderedLinks.length} saved links.` });
  speak(spokenMsg);
}

async function siteSearch(site: string, query: string) {
  const { siteTemplates } = await getSettings();
  const template = findTemplate(siteTemplates, site) ?? defaultSiteTemplates.find(t => t.site.toLowerCase() === site.toLowerCase());

  if (!template) {
    await webSearch(`${site} ${query}`, false);
    return;
  }

  await chrome.tabs.create({ url: buildSiteSearchUrl(template, query), active: true });
  broadcastPanelUpdate({ status: `Searching ${template.site}`, transcript: query });
  speak(`Opening ${template.site} search for ${query}`);
}

async function webSearch(query: string, summarizeAfterNavigation: boolean) {
  const { backendBaseUrl } = await getSettings();
  const result = await apiFetch<SearchResponse>(`${backendBaseUrl}/api/search`, { query });
  const tab = await getActiveTab();

  if (tab.id) {
    await chrome.tabs.update(tab.id, { url: result.top.url, active: true });
    if (summarizeAfterNavigation) {
      await waitForTabLoad(tab.id);
      await summarizeTab(tab.id, 'steps');
    } else {
      speak(`Opening ${result.top.title}`);
    }
  } else {
    await chrome.tabs.create({ url: result.top.url, active: true });
    if (!summarizeAfterNavigation) {
      speak(`Opening ${result.top.title}`);
    }
  }

  broadcastPanelUpdate({ status: `Opened ${result.top.title}`, transcript: query });
}

async function summarizeActivePage(mode: 'summary' | 'steps') {
  const tab = await getActiveTab();
  if (!tab.id) {
    broadcastPanelUpdate({ status: 'No active tab found.' });
    return;
  }

  await summarizeTab(tab.id, mode);
}

async function summarizeTab(tabId: number, mode: 'summary' | 'steps') {
  const { backendBaseUrl } = await getSettings();
  broadcastPanelUpdate({ status: 'Extracting page content...' });

  const pageContent = await extractContent(tabId);
  broadcastPanelUpdate({ status: 'Summarizing with AI...' });

  const result = await apiFetch<SummaryResponse>(`${backendBaseUrl}/api/summarize`, {
    ...pageContent,
    mode
  });

  broadcastPanelUpdate({
    status: 'Summary ready',
    summary: result.summary,
    spokenSummary: result.spokenSummary,
    keyPoints: result.keyPoints
  });
  speak(result.spokenSummary);
}

async function extractContent(tabId: number): Promise<PageContent> {
  const tab = await chrome.tabs.get(tabId);
  const url = tab.url || '';

  if (
    !url ||
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('about:') ||
    url.includes('chromewebstore.google.com')
  ) {
    throw new Error('Cannot summarize Chrome system or extension pages. Please open an article or web page.');
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const main = document.querySelector('main, article') ?? document.body;
      const text = (main.textContent ?? document.body.innerText ?? '').replace(/\s+/g, ' ').trim();

      return {
        title: document.title || location.hostname,
        url: location.href,
        text
      };
    }
  });

  const result = results?.[0]?.result;
  if (!result || !result.text) {
    return {
      title: tab.title || 'Web Page',
      url: tab.url || '',
      text: 'No readable text content found on page.'
    };
  }

  return result;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function waitForTabLoad(tabId: number) {
  const tab = await chrome.tabs.get(tabId);
  if (tab.status === 'complete') {
    return;
  }

  await new Promise<void>((resolve) => {
    const listener = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };

    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function apiFetch<T>(url: string, body: unknown): Promise<T> {
  stopCurrentFetchOnly();
  activeController = new AbortController();

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: activeController.signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const msg = errorData?.error || `API request failed with ${response.status}`;
    throw new Error(msg);
  }

  return response.json() as Promise<T>;
}

function stopCurrentWork() {
  stopCurrentFetchOnly();
  stopSpeaking();
  readAloudState.active = false;
  readAloudState.isPaused = false;
  broadcastPanelUpdate({ status: 'Stopped', listening, readAloudStatus: 'stopped' });
}

function stopCurrentFetchOnly() {
  activeController?.abort();
  activeController = undefined;
}

// --- STATEFUL READ ALOUD ENGINE ---
interface ReadAloudState {
  paragraphs: string[];
  currentIndex: number;
  isPaused: boolean;
  active: boolean;
}

let readAloudState: ReadAloudState = {
  paragraphs: [],
  currentIndex: 0,
  isPaused: false,
  active: false
};

function speakParagraph(index: number) {
  if (!readAloudState.active || readAloudState.isPaused) return;

  if (index >= readAloudState.paragraphs.length) {
    readAloudState.active = false;
    readAloudState.isPaused = false;
    readAloudState.currentIndex = 0;
    broadcastPanelUpdate({ status: 'Finished reading page aloud.', readAloudStatus: 'stopped' });
    speak('Finished reading page.');
    return;
  }

  const paragraph = readAloudState.paragraphs[index];
  broadcastPanelUpdate({
    status: `Reading aloud (${index + 1}/${readAloudState.paragraphs.length})`,
    readAloudStatus: 'playing'
  });

  chrome.tts.stop();
  chrome.tts.speak(paragraph, {
    rate: 1,
    enqueue: false,
    onEvent: (event) => {
      if (event.type === 'end') {
        if (readAloudState.active && !readAloudState.isPaused) {
          readAloudState.currentIndex++;
          speakParagraph(readAloudState.currentIndex);
        }
      }
    }
  });
}

async function handleReadPageAloud() {
  const tab = await getActiveTab();
  if (!tab?.id) {
    broadcastPanelUpdate({ status: 'No active tab found.' });
    return;
  }

  broadcastPanelUpdate({ status: 'Extracting text for reading aloud...' });
  const content = await extractContent(tab.id);

  const paragraphs = content.text
    .split(/(?:\r?\n){2,}|\.\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 15);

  if (paragraphs.length === 0) {
    broadcastPanelUpdate({ status: 'No readable text found on page.' });
    speak('No readable text found on page.');
    return;
  }

  readAloudState = {
    paragraphs,
    currentIndex: 0,
    isPaused: false,
    active: true
  };

  speakParagraph(0);
}

function handleTTSControl(action: 'pause' | 'continue' | 'start' | 'stop') {
  if (action === 'pause') {
    readAloudState.isPaused = true;
    chrome.tts.stop();
    broadcastPanelUpdate({ status: 'Paused reading aloud.', readAloudStatus: 'paused' });
    speak('Paused reading.');
  } else if (action === 'continue') {
    if (readAloudState.paragraphs.length === 0) {
      speak('Nothing to continue. Say read page aloud first.');
      return;
    }
    readAloudState.isPaused = false;
    readAloudState.active = true;
    speakParagraph(readAloudState.currentIndex);
    broadcastPanelUpdate({ status: `Resumed reading aloud (${readAloudState.currentIndex + 1}/${readAloudState.paragraphs.length}).`, readAloudStatus: 'playing' });
  } else if (action === 'start') {
    if (readAloudState.paragraphs.length === 0) {
      speak('Nothing to start. Say read page aloud first.');
      return;
    }
    readAloudState.currentIndex = 0;
    readAloudState.isPaused = false;
    readAloudState.active = true;
    speakParagraph(0);
    broadcastPanelUpdate({ status: 'Started reading from beginning.', readAloudStatus: 'playing' });
  } else if (action === 'stop') {
    readAloudState.active = false;
    readAloudState.isPaused = false;
    chrome.tts.stop();
    broadcastPanelUpdate({ status: 'Stopped speech.', readAloudStatus: 'stopped' });
  }
}

async function navigateHistory(direction: 'back' | 'forward') {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (dir: string) => {
      if (dir === 'back') history.back();
      else if (dir === 'forward') history.forward();
    },
    args: [direction]
  }).catch(() => undefined);
  const label = direction === 'back' ? 'Went back' : 'Went forward';
  broadcastPanelUpdate({ status: label });
  speak(label);
}

async function reloadTab() {
  const tab = await getActiveTab();
  if (tab?.id) {
    await chrome.tabs.reload(tab.id);
    broadcastPanelUpdate({ status: 'Reloaded page.' });
    speak('Reloaded page.');
  }
}

async function duplicateActiveTab() {
  const tab = await getActiveTab();
  if (tab?.id) {
    await chrome.tabs.duplicate(tab.id);
    broadcastPanelUpdate({ status: 'Duplicated tab.' });
    speak('Duplicated tab.');
  }
}

async function openNewWindow() {
  await chrome.windows.create({ focused: true });
  broadcastPanelUpdate({ status: 'Opened new window.' });
  speak('Opened new window.');
}

async function closeCurrentWindow() {
  const win = await chrome.windows.getCurrent();
  if (win.id) {
    await chrome.windows.remove(win.id);
  }
}

async function zoomPage(action: 'in' | 'out' | 'reset') {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  if (action === 'reset') {
    await chrome.tabs.setZoom(tab.id, 1.0);
    broadcastPanelUpdate({ status: 'Zoom reset to 100%.' });
    speak('Zoom reset.');
    return;
  }
  const currentZoom = await chrome.tabs.getZoom(tab.id);
  let newZoom = action === 'in' ? currentZoom + 0.15 : currentZoom - 0.15;
  if (newZoom < 0.5) newZoom = 0.5;
  if (newZoom > 3.0) newZoom = 3.0;
  await chrome.tabs.setZoom(tab.id, newZoom);
  const pct = Math.round(newZoom * 100);
  broadcastPanelUpdate({ status: `Zoom set to ${pct}%.` });
  speak(`Zoom ${action === 'in' ? 'in' : 'out'} to ${pct} percent.`);
}

async function bookmarkActivePage() {
  const tab = await getActiveTab();
  if (!tab?.url) return;
  await chrome.bookmarks.create({
    title: tab.title || 'Bookmarked Page',
    url: tab.url
  });
  broadcastPanelUpdate({ status: `Bookmarked "${tab.title || 'page'}"!` });
  speak('Page bookmarked.');
}

// --- TAB MANAGEMENT HANDLERS ---
async function findTabByTarget(target?: string) {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!target || target === 'this' || target === 'current' || target === 'tab') {
    return activeTab;
  }

  const aliasMap: Record<string, string> = {
    'the gift': 'github',
    'gift': 'github',
    'git hub': 'github',
    'yt': 'youtube',
    'x': 'twitter'
  };

  const lowerTarget = (aliasMap[target.toLowerCase().trim()] || target.toLowerCase()).trim();
  const tabs = await chrome.tabs.query({ currentWindow: true });

  const matched = tabs.find(
    (t) =>
      t.title?.toLowerCase().includes(lowerTarget) ||
      t.url?.toLowerCase().includes(lowerTarget)
  );

  return matched;
}

async function openNewTab() {
  await chrome.tabs.create({ active: true });
  broadcastPanelUpdate({ status: 'Opened a new tab.' });
  speak('Opened a new tab.');
}

async function closeActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.tabs.remove(tab.id);
    broadcastPanelUpdate({ status: `Closed tab: ${tab.title || 'active tab'}` });
    speak('Closed tab.');
  }
}

async function switchToTab(tabIndex: number) {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  if (tabs.length === 0) return;

  const targetIndex = tabIndex - 1;
  const targetTab = tabs[targetIndex];

  if (targetTab?.id) {
    await chrome.tabs.update(targetTab.id, { active: true });
    broadcastPanelUpdate({ status: `Switched to tab ${tabIndex}: ${targetTab.title || ''}` });
    speak(`Switched to tab ${tabIndex}.`);
  } else {
    broadcastPanelUpdate({ status: `Tab ${tabIndex} does not exist (${tabs.length} tabs open).` });
    speak(`Only ${tabs.length} tabs open.`);
  }
}

async function switchToTabTitle(target: string) {
  const tab = await findTabByTarget(target);
  if (tab?.id) {
    await chrome.tabs.update(tab.id, { active: true });
    broadcastPanelUpdate({ status: `Switched to ${tab.title || target}` });
    speak(`Switched to ${tab.title || target}.`);
  } else {
    const normalized = target.toLowerCase().trim();
    if (normalized.includes('github') || normalized.includes('gift')) {
      await chrome.tabs.create({ url: 'https://github.com', active: true });
      broadcastPanelUpdate({ status: 'Opened GitHub in new tab.' });
      speak('Opening GitHub.');
    } else if (normalized.includes('youtube')) {
      await chrome.tabs.create({ url: 'https://youtube.com', active: true });
      broadcastPanelUpdate({ status: 'Opened YouTube in new tab.' });
      speak('Opening YouTube.');
    } else {
      broadcastPanelUpdate({ status: `No open tab found matching "${target}".` });
      speak(`No tab found matching ${target}.`);
    }
  }
}

async function navigateTabDir(direction: 'next' | 'prev') {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  if (tabs.length < 2) return;

  const activeIndex = tabs.findIndex((t) => t.active);
  let nextIndex = direction === 'next' ? activeIndex + 1 : activeIndex - 1;

  if (nextIndex >= tabs.length) nextIndex = 0;
  if (nextIndex < 0) nextIndex = tabs.length - 1;

  const targetTab = tabs[nextIndex];
  if (targetTab?.id) {
    await chrome.tabs.update(targetTab.id, { active: true });
    broadcastPanelUpdate({ status: `Switched to ${targetTab.title || 'tab'}` });
  }
}
async function closeOtherTabs() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const tabsToRemove = tabs.filter((t) => t.id && t.id !== activeTab?.id).map((t) => t.id!);
  if (tabsToRemove.length > 0) {
    await chrome.tabs.remove(tabsToRemove);
    broadcastPanelUpdate({ status: `Closed ${tabsToRemove.length} other tabs.` });
    speak(`Closed ${tabsToRemove.length} other tabs.`);
  } else {
    broadcastPanelUpdate({ status: 'No other tabs to close.' });
  }
}

async function closeDuplicateTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const seen = new Set<string>();
  const duplicates: number[] = [];
  for (const tab of tabs) {
    if (tab.url && tab.id) {
      if (seen.has(tab.url)) {
        duplicates.push(tab.id);
      } else {
        seen.add(tab.url);
      }
    }
  }
  if (duplicates.length > 0) {
    await chrome.tabs.remove(duplicates);
    broadcastPanelUpdate({ status: `Closed ${duplicates.length} duplicate tabs.` });
    speak(`Closed ${duplicates.length} duplicate tabs.`);
  } else {
    broadcastPanelUpdate({ status: 'No duplicate tabs found.' });
    speak('No duplicate tabs found.');
  }
}

async function muteOtherTabs() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabs = await chrome.tabs.query({ currentWindow: true });
  for (const tab of tabs) {
    if (tab.id && tab.id !== activeTab?.id) {
      await chrome.tabs.update(tab.id, { muted: true });
    }
  }
  broadcastPanelUpdate({ status: 'Muted all other tabs.' });
  speak('Muted other tabs.');
}

async function setTabMuted(target?: string, muted: boolean = true) {
  const tab = await findTabByTarget(target);
  if (tab?.id) {
    await chrome.tabs.update(tab.id, { muted });
    const label = tab.title || target || 'tab';
    broadcastPanelUpdate({ status: `${muted ? 'Muted' : 'Unmuted'} ${label}` });
    speak(`${muted ? 'Muted' : 'Unmuted'} tab.`);
  }
}

async function setTabPinned(target?: string, pinned: boolean = true) {
  const tab = await findTabByTarget(target);
  if (tab?.id) {
    await chrome.tabs.update(tab.id, { pinned });
    const label = tab.title || target || 'tab';
    broadcastPanelUpdate({ status: `${pinned ? 'Pinned' : 'Unpinned'} ${label}` });
    speak(`${pinned ? 'Pinned' : 'Unpinned'} tab.`);
  }
}

async function reopenClosedTab() {
  await chrome.sessions.restore();
  broadcastPanelUpdate({ status: 'Reopened last closed tab.' });
  speak('Reopened closed tab.');
}

async function groupTabsByDomain() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const domainMap: Record<string, number[]> = {};
  for (const tab of tabs) {
    if (tab.url && tab.id && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
      try {
        const hostname = new URL(tab.url).hostname.replace(/^www\./, '');
        if (!domainMap[hostname]) domainMap[hostname] = [];
        domainMap[hostname].push(tab.id);
      } catch {}
    }
  }
  let count = 0;
  for (const [domain, tabIds] of Object.entries(domainMap)) {
    if (tabIds.length > 1) {
      const groupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupId, { title: domain });
      count++;
    }
  }
  broadcastPanelUpdate({ status: `Grouped tabs into ${count} domain groups.` });
  speak(`Grouped tabs into domain groups.`);
}

// --- MEDIA CONTROL HANDLER ---
async function handleMediaControl(action: 'play' | 'pause' | 'stop' | 'mute' | 'unmute' | 'speed', rate?: number) {
  const tab = await getActiveTab();
  if (!tab?.id) return;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (act: string, r?: number) => {
      let operated = false;

      // 1. YouTube specific controls
      const ytPlayBtn = document.querySelector<HTMLButtonElement>('.ytp-play-button');
      if (ytPlayBtn && location.hostname.includes('youtube.com')) {
        const isPlaying = !ytPlayBtn.classList.contains('ytp-play-button-paused') &&
                          document.querySelector('video')?.paused === false;

        if (act === 'pause' || act === 'stop') {
          if (isPlaying) {
            ytPlayBtn.click();
            operated = true;
          }
        } else if (act === 'play') {
          if (!isPlaying) {
            ytPlayBtn.click();
            operated = true;
          }
        }
      }

      // 2. HTML5 Media Elements (<video> & <audio>)
      const media = Array.from(document.querySelectorAll<HTMLMediaElement>('video, audio'));
      if (media.length > 0) {
        media.forEach((el) => {
          if (act === 'play') {
            void el.play();
            operated = true;
          } else if (act === 'pause' || act === 'stop') {
            el.pause();
            operated = true;
          } else if (act === 'mute') {
            el.muted = true;
            operated = true;
          } else if (act === 'unmute') {
            el.muted = false;
            operated = true;
          } else if (act === 'speed' && r) {
            el.playbackRate = r;
            operated = true;
          }
        });
      }

      // 3. Fallback: Dispatch YouTube / HTML5 keyboard shortcut 'k'
      if (!operated && (act === 'play' || act === 'pause' || act === 'stop')) {
        const kEvent = new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', keyCode: 75, which: 75, bubbles: true });
        document.dispatchEvent(kEvent);
        operated = true;
      }

      return operated;
    },
    args: [action, rate ?? 1.0]
  });

  const descriptions: Record<string, string> = {
    play: 'Playing video',
    pause: 'Paused video',
    stop: 'Stopped video',
    mute: 'Muted video',
    unmute: 'Unmuted video',
    speed: `Set playback speed to ${rate}x`
  };
  const desc = descriptions[action] || 'Updated video playback';
  broadcastPanelUpdate({ status: desc });
  speak(desc);
}

// --- READER MODE HANDLER ---
async function handleToggleReaderMode() {
  const tab = await getActiveTab();
  if (!tab?.id) return;

  const content = await extractContent(tab.id);
  broadcastPanelUpdate({
    status: 'Clean Reader View Active',
    readerModeActive: true,
    readerContent: content
  });
  speak('Entered clean reader mode.');
}

// --- QUICK CLIPBOARD & UTILITIES ---
async function handleCopyToClipboard(target: 'url' | 'title') {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  const text = target === 'url' ? tab.url || '' : tab.title || '';

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (val: string) => {
      try {
        const el = document.createElement('textarea');
        el.value = val;
        el.style.position = 'fixed';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand('copy');
        el.remove();
      } catch {
        void navigator.clipboard?.writeText(val);
      }
    },
    args: [text]
  }).catch(() => undefined);

  const label = target === 'url' ? 'URL' : 'Page Title';
  broadcastPanelUpdate({ status: `Copied ${label} to clipboard!` });
  speak(`Copied ${label}.`);
}

async function handleTakeScreenshot() {
  const dataUrl = await chrome.tabs.captureVisibleTab();
  const filename = `UrPilot-Screenshot-${Date.now()}.png`;
  await chrome.downloads.download({ url: dataUrl, filename });
  broadcastPanelUpdate({ status: 'Screenshot saved to Downloads folder!' });
  speak('Screenshot captured.');
}

async function handleScroll(direction: 'up' | 'down' | 'top' | 'bottom') {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (dir: string) => {
      if (dir === 'down') window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
      else if (dir === 'up') window.scrollBy({ top: -window.innerHeight * 0.75, behavior: 'smooth' });
      else if (dir === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      else if (dir === 'bottom') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    },
    args: [direction]
  });
  broadcastPanelUpdate({ status: `Scrolled ${direction}.` });
}

async function handleHighlight(keyword: string) {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (kw: string) => {
      (window as any).find(kw, false, false, true, false, false, true);
    },
    args: [keyword]
  });
  broadcastPanelUpdate({ status: `Highlighted "${keyword}" on page.` });
  speak(`Highlighted ${keyword}.`);
}

// --- TIMERS & ALARMS ---
async function handleSetTimer(minutes: number, label?: string) {
  const name = `timer_${Date.now()}_${label || 'Timer'}`;
  await chrome.alarms.create(name, { delayInMinutes: minutes });
  broadcastPanelUpdate({ status: `Timer set for ${minutes} min.` });
  speak(`Timer set for ${minutes} minute${minutes > 1 ? 's' : ''}.`);
}

async function handleSetReminder(minutes: number, message: string) {
  const name = `timer_${Date.now()}_${message}`;
  await chrome.alarms.create(name, { delayInMinutes: minutes });
  broadcastPanelUpdate({ status: `Reminder set for ${minutes} min: "${message}"` });
  speak(`Reminder set for ${minutes} minutes.`);
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('timer_')) {
    const parts = alarm.name.split('_');
    const label = parts.slice(2).join('_') || 'Timer';
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('src/assets/icon.png'),
        title: 'UrPilot Reminder',
        message: `⏰ Alert: ${label}`,
        priority: 2
      });
    } catch {}
    speak(`UrPilot Alert: ${label}`);
    broadcastPanelUpdate({ status: `⏰ Alarm finished: ${label}` });
  }
});
