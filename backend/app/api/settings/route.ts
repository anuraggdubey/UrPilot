import { jsonResponse, optionsResponse } from '@/lib/cors';

export function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export function GET(req: Request) {
  return jsonResponse(req, {
    phase: 2,
    message: 'Settings sync is reserved for the Supabase-backed product phase.'
  }, { status: 501 });
}

export function PUT(req: Request) {
  return jsonResponse(req, {
    phase: 2,
    message: 'Settings sync is reserved for the Supabase-backed product phase.'
  }, { status: 501 });
}
