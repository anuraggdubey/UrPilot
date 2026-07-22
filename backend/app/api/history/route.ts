import { jsonResponse, optionsResponse } from '@/lib/cors';

export function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export function GET(req: Request) {
  return jsonResponse(req, {
    phase: 2,
    message: 'History sync is reserved for the Supabase-backed product phase.'
  }, { status: 501 });
}
