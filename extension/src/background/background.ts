import { parseCommand } from './commandRouter';
import { broadcastPanelUpdate, speak, stopSpeaking } from './messageHub';
import { buildSiteSearchUrl, findTemplate } from '../lib/siteTemplates';
import { getSettings } from '../lib/storage';
import type { ExtensionMessage, PageContent, SearchResponse, SummaryResponse } from '../lib/types';

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
  void handleMessage(message).then(sendResponse).catch((error) => {
    broadcastPanelUpdate({ status: 'Error', error: error instanceof Error ? error.message : String(error) });
    sendResponse({ ok: false });
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
  const command = parseCommand(transcript, settings.siteTemplates);

  broadcastPanelUpdate({ status: 'Heard command', transcript });

  switch (command.intent) {
    case 'OPEN_SAVED_LINKS':
      await openSavedLinks();
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
    case 'STOP':
      stopCurrentWork();
      break;
    case 'UNKNOWN':
      broadcastPanelUpdate({ status: "I couldn't match that command.", transcript });
      break;
  }
}

async function openSavedLinks() {
  const { savedLinks } = await getSettings();
  const orderedLinks = [...savedLinks].sort((a, b) => a.order - b.order);

  if (orderedLinks.length === 0) {
    broadcastPanelUpdate({ status: 'No saved links yet. Add them in Options.' });
    return;
  }

  for (const [index, link] of orderedLinks.entries()) {
    await chrome.tabs.create({ url: link.url, active: index === 0 });
  }

  broadcastPanelUpdate({ status: `Opened ${orderedLinks.length} saved links.` });
}

async function siteSearch(site: string, query: string) {
  const { siteTemplates } = await getSettings();
  const template = findTemplate(siteTemplates, site);

  if (!template) {
    broadcastPanelUpdate({ status: `No search template for ${site}.` });
    return;
  }

  await chrome.tabs.create({ url: buildSiteSearchUrl(template, query), active: true });
  broadcastPanelUpdate({ status: `Searching ${template.site}`, transcript: query });
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
    }
  } else {
    await chrome.tabs.create({ url: result.top.url, active: true });
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
  const pageContent = await extractContent(tabId);
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
  const [{ result }] = await chrome.scripting.executeScript({
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

  if (!result?.text) {
    throw new Error('Could not extract readable page text');
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
    throw new Error(`API request failed with ${response.status}`);
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
