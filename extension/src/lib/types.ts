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
  | { intent: 'SITE_SEARCH'; site: string; query: string }
  | { intent: 'WEB_SEARCH'; query: string }
  | { intent: 'WEB_SEARCH_THEN_SUMMARIZE'; query: string }
  | { intent: 'SUMMARIZE_PAGE' }
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

