import { jsonResponse, optionsResponse } from '@/lib/cors';
import { errorPayload } from '@/lib/http';
import { searchWeb } from '@/lib/tavily';
import { z } from 'zod';

const bodySchema = z.object({
  query: z.string().trim().min(2).max(500)
});

export function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  try {
    const { query } = bodySchema.parse(await req.json());
    const result = await searchWeb(query);
    return jsonResponse(req, result);
  } catch (error) {
    return jsonResponse(req, errorPayload(error), { status: 400 });
  }
}
