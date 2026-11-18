import { parseDraft } from '../src/recommendations.ts';
import { demoRecommendations } from './demo.ts';
import { recommendWithGemini } from './gemini.ts';
type Env = { RECOMMENDATION_MODE?: string; GEMINI_API_KEY?: string; ALLOWED_ORIGIN?: string };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const handler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname !== '/api/recommendations') return json({ error: 'NOT_FOUND' }, 404);
    if (request.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({ error: 'JSON_REQUIRED' }, 415);
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'INVALID_INPUT' }, 400);
    try {
      let size = 0; const chunks: Uint8Array[] = [];
      while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 8192) { await reader.cancel(); return json({ error: 'PAYLOAD_TOO_LARGE' }, 413); } chunks.push(value); }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      const draft = parseDraft(JSON.parse(new TextDecoder().decode(bytes)));
      if (env.RECOMMENDATION_MODE === 'demo') return json(demoRecommendations(draft));
      if (env.RECOMMENDATION_MODE !== 'gemini' || !env.GEMINI_API_KEY) return json({ error: 'AI_PROVIDER_NOT_CONFIGURED' }, 503);
      if (!draft.externalConsent) return json({ error: 'CONSENT_REQUIRED' }, 400);
      try { return json(await recommendWithGemini(draft, env.GEMINI_API_KEY)); }
      catch { return json({ error: 'RECOMMENDATION_FAILED' }, 502); }
    } catch { return json({ error: 'INVALID_INPUT' }, 400); }
    finally { reader.releaseLock(); }
  },
};
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    if (origin && origin !== env.ALLOWED_ORIGIN) return json({ error: 'ORIGIN_NOT_ALLOWED' }, 403);
    const response = request.method === 'OPTIONS' && origin
      ? new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } })
      : await handler.fetch(request, env);
    if (origin) { response.headers.set('Access-Control-Allow-Origin', origin); response.headers.set('Vary', 'Origin'); }
    return response;
  },
};
