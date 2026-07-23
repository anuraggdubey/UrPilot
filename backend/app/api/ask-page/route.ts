import { jsonResponse, optionsResponse } from '@/lib/cors';
import { errorPayload } from '@/lib/http';
import { callLLM } from '@/lib/llm';
import { askPageSystemPrompt } from '@/lib/prompts';
import { z } from 'zod';

const bodySchema = z.object({
  url: z.string().url().optional(),
  title: z.string().trim().default('Active Page'),
  text: z.string().trim().default(''),
  question: z.string().trim().min(1)
});

const answerSchema = z.object({
  answer: z.string(),
  spokenAnswer: z.string()
});

export function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  try {
    const { url, title, text, question } = bodySchema.parse(await req.json());

    const userPrompt = [
      `User Question: "${question}"`,
      `Page Title: ${title}`,
      `URL: ${url || 'Unknown'}`,
      `Page Content:`,
      text.slice(0, 12000)
    ].join('\n\n');

    const result = await callLLM<unknown>({
      system: askPageSystemPrompt,
      user: userPrompt
    });

    return jsonResponse(req, answerSchema.parse(result));
  } catch (error) {
    return jsonResponse(req, errorPayload(error), { status: 400 });
  }
}
