import { jsonResponse, optionsResponse } from '@/lib/cors';

export function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export function GET(req: Request) {
  return jsonResponse(req, {
    ok: true,
    service: 'urpilot-api'
  });
}
