import { jsonResponse, optionsResponse } from '@/lib/cors';
import { errorPayload } from '@/lib/http';
import { callLLM } from '@/lib/llm';
import { summarizeSystemPrompt } from '@/lib/prompts';
import { z } from 'zod';

const bodySchema = z.object({
  url: z.string().url(),
  title: z.string().trim().default('Untitled Page'),
  text: z.string().trim().default(''),
  mode: z.enum(['summary', 'steps']).default('summary')
});

const summarySchema = z.object({
  summary: z.string(),
  spokenSummary: z.string(),
  keyPoints: z.array(z.string()).default([])
});

export function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  try {
    const { url, title, text, mode } = bodySchema.parse(await req.json());

    if (text.length < 20) {
      return jsonResponse(req, {
        summary: 'This page does not contain sufficient text to summarize.',
        spokenSummary: 'This page does not have enough text content to summarize.',
        keyPoints: ['Sparse content', 'Try summarizing an article or documentation page']
      });
    }

    const result = await callLLM<unknown>({
      system: summarizeSystemPrompt(mode),
      user: `Title: ${title}\nURL: ${url}\n\n${text.slice(0, 10000)}`
    });

    return jsonResponse(req, summarySchema.parse(result));
  } catch (error) {
    return jsonResponse(req, errorPayload(error), { status: 400 });
  }
}
