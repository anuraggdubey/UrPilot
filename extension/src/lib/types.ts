export type SavedLink = {
  id: string;
  label: string;
  url: string;
  order: number;
};

export type SiteTemplate = {
  id: string;
  site: string;
  urlTemplate: string;
  isDefault?: boolean;
};

export type ActiveStep = 'search' | 'navigate' | 'summarize' | null;

export type PanelPayload = {
  summary?: string;
  spokenSummary?: string;
  keyPoints?: string[];
  transcript?: string;
  interimTranscript?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  status: string;
  listening?: boolean;
  speaking?: boolean;
  processing?: boolean;
  activeStep?: ActiveStep;
  error?: string;
  micPermissionDenied?: boolean;
  readerModeActive?: boolean;
  readerContent?: { title: string; text: string; url: string };
  readAloudStatus?: 'playing' | 'paused' | 'stopped';
};

export type UserPreferences = {
  autoRestartOnSilence: boolean;
  autoReadSummaries: boolean;
  playbackSpeed: 1.0 | 1.25 | 1.5;
  activeModel: string;
  pushToTalkShortcut: string;
};

export type PageContent = {
  title: string;
  text: string;
  url: string;
};

export type ExtensionMessage =
  | { type: 'START_LISTENING' }
  | { type: 'STOP_LISTENING' }
  | { type: 'TOGGLE_LISTENING' }
  | { type: 'TRANSCRIPT_INTERIM'; text: string }
  | { type: 'TRANSCRIPT_FINAL'; text: string }
  | { type: 'EXTRACT_CONTENT' }
  | { type: 'PAGE_CONTENT'; title: string; text: string; url: string }
  | { type: 'ROUTE_COMMAND'; transcript: string }
  | { type: 'PANEL_UPDATE'; payload: PanelPayload }
  | { type: 'SPEAK'; text: string }
  | { type: 'STOP_SPEAKING' };

export type CommandIntent =
  | { intent: 'OPEN_SAVED_LINKS' }
  | { intent: 'OPEN_DIRECT_URL'; label: string; url: string }
  | { intent: 'SITE_SEARCH'; site: string; query: string }
  | { intent: 'WEB_SEARCH'; query: string }
  | { intent: 'WEB_SEARCH_THEN_SUMMARIZE'; query: string }
  | { intent: 'SUMMARIZE_PAGE' }
  | { intent: 'ASK_PAGE_QUESTION'; question: string }
  | { intent: 'CLOSE_ACTIVE_TAB' }
  | { intent: 'CLOSE_OTHER_TABS' }
  | { intent: 'CLOSE_DUPLICATE_TABS' }
  | { intent: 'MUTE_OTHER_TABS' }
  | { intent: 'MUTE_TAB'; target?: string }
  | { intent: 'UNMUTE_TAB'; target?: string }
  | { intent: 'PIN_TAB'; target?: string }
  | { intent: 'UNPIN_TAB'; target?: string }
  | { intent: 'REOPEN_CLOSED_TAB' }
  | { intent: 'GROUP_TABS_BY_DOMAIN' }
  | { intent: 'SWITCH_TO_TAB'; tabIndex: number }
  | { intent: 'SWITCH_TO_TAB_TITLE'; target: string }
  | { intent: 'NAVIGATE_TAB_DIR'; direction: 'next' | 'prev' }
  | { intent: 'MEDIA_CONTROL'; action: 'play' | 'pause' | 'stop' | 'mute' | 'unmute' | 'speed'; rate?: number }
  | { intent: 'READ_PAGE_ALOUD' }
  | { intent: 'TTS_CONTROL'; action: 'pause' | 'continue' | 'start' | 'stop' }
  | { intent: 'TOGGLE_READER_MODE' }
  | { intent: 'COPY_TO_CLIPBOARD'; target: 'url' | 'title' }
  | { intent: 'TAKE_SCREENSHOT' }
  | { intent: 'SCROLL_PAGE'; direction: 'up' | 'down' | 'top' | 'bottom' }
  | { intent: 'HIGHLIGHT_KEYWORD'; keyword: string }
  | { intent: 'SET_TIMER'; minutes: number; label?: string }
  | { intent: 'SET_REMINDER'; minutes: number; message: string }
  | { intent: 'STOP' }
  | { intent: 'UNKNOWN'; transcript: string };

export type SearchResponse = {
  top: {
    title: string;
    url: string;
    snippet: string;
  };
  alternates: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
};

export type SummaryResponse = {
  summary: string;
  spokenSummary: string;
  keyPoints: string[];
};

export type AskPageResponse = {
  answer: string;
  spokenAnswer: string;
};

