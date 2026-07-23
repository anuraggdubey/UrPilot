import { parseCommand } from './commandRouter';
import { broadcastPanelUpdate, speak, stopSpeaking } from './messageHub';
import { buildSiteSearchUrl, defaultSiteTemplates, findTemplate } from '../lib/siteTemplates';
import { getSettings } from '../lib/storage';
import type { AskPageResponse, ExtensionMessage, PageContent, SearchResponse, SummaryResponse } from '../lib/types';

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
      broadcastPanelUpdate({ status: 'Listening', transcript: message.text, listening: true });
      return { ok: true };
    case 'TRANSCRIPT_FINAL':
    case 'ROUTE_COMMAND':
      await routeTranscript(message.type === 'TRANSCRIPT_FINAL' ? message.text : message.transcript);
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

async function routeTranscript(transcript: string) {
  const settings = await getSettings();
  let command = parseCommand(transcript, settings.siteTemplates);

  broadcastPanelUpdate({ status: 'Processing speech...', transcript });

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
  broadcastPanelUpdate({ status: 'Stopped', listening });
}

function stopCurrentFetchOnly() {
  activeController?.abort();
  activeController = undefined;
}
