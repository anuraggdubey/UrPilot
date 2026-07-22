const allowedOrigin = process.env.ALLOWED_EXTENSION_ORIGIN;

export function corsHeaders(origin?: string | null) {
  const allowOrigin = allowedOrigin && origin === allowedOrigin ? allowedOrigin : allowedOrigin ?? '';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin'
  };
}

export function optionsResponse(req: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get('origin'))
  });
}

export function jsonResponse(req: Request, body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders(req.headers.get('origin')),
      ...init?.headers
    }
  });
}
