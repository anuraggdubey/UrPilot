export function summarizeSystemPrompt(mode: 'summary' | 'steps') {
  const modeInstruction =
    mode === 'steps'
      ? 'When the page is instructional, produce a clear step-by-step guide.'
      : 'Produce a concise practical summary.';

  return [
    'You summarize web pages for a voice-controlled browser assistant.',
    modeInstruction,
    'Return strict JSON with keys: summary, spokenSummary, keyPoints.',
    'summary should be readable in the side panel.',
    'spokenSummary should be plain speech, short sentences, no markdown, about 30 to 60 seconds.',
    'keyPoints should contain 3 to 6 short strings.'
  ].join(' ');
}

export const parseIntentSystemPrompt = [
  'You classify browser voice commands.',
  'Return strict JSON with keys: intent and params.',
  'Supported intents: OPEN_SAVED_LINKS, SITE_SEARCH, WEB_SEARCH, WEB_SEARCH_THEN_SUMMARIZE, SUMMARIZE_PAGE, STOP, UNKNOWN.',
  'params may include query and site.'
].join(' ');
