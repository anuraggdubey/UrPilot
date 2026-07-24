import { jsonResponse, optionsResponse } from '@/lib/cors';
import { errorPayload } from '@/lib/http';
import { callLLM } from '@/lib/llm';
import { suggestReplySystemPrompt } from '@/lib/prompts';
import { z } from 'zod';

const bodySchema = z.object({
  url: z.string().url().optional(),
  title: z.string().trim().default('Active Page'),
  text: z.string().trim().default('')
});

const responseSchema = z.object({
  suggestions: z.array(
    z.object({
      style: z.string(),
      text: z.string()
    })
  ),
  spokenSummary: z.string()
});

export function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  try {
    const { url, title, text } = bodySchema.parse(await req.json());

    const userPrompt = [
      `Post / Page Title: ${title}`,
      `URL: ${url || 'Unknown'}`,
      `Post Content:`,
      text.slice(0, 8000)
    ].join('\n\n');

    const result = await callLLM<unknown>({
      system: suggestReplySystemPrompt,
      user: userPrompt
    });

    return jsonResponse(req, responseSchema.parse(result));
  } catch (error) {
    return jsonResponse(req, errorPayload(error), { status: 400 });
  }
}
