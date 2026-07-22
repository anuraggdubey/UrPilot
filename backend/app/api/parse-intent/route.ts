import { jsonResponse, optionsResponse } from '@/lib/cors';
import { errorPayload } from '@/lib/http';
import { callLLM } from '@/lib/llm';
import { parseIntentSystemPrompt } from '@/lib/prompts';
import { z } from 'zod';

const bodySchema = z.object({
  transcript: z.string().trim().min(1).max(500)
});

const intentSchema = z.object({
  intent: z.enum([
    'OPEN_SAVED_LINKS',
    'SITE_SEARCH',
    'WEB_SEARCH',
    'WEB_SEARCH_THEN_SUMMARIZE',
    'SUMMARIZE_PAGE',
    'STOP',
    'UNKNOWN'
  ]),
  params: z.record(z.unknown()).default({})
});

export function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  try {
    const { transcript } = bodySchema.parse(await req.json());
    const result = await callLLM<unknown>({
      model: 'llama-3.1-8b-instant',
      system: parseIntentSystemPrompt,
      user: transcript
    });

    return jsonResponse(req, intentSchema.parse(result));
  } catch (error) {
    return jsonResponse(req, errorPayload(error), { status: 400 });
  }
}
