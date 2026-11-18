import type { Plugin } from 'vite';
import worker from '../worker/index.ts';

// Local development exercises the same handler as the deployed Worker.
// This middleware is not included in the browser bundle or a static preview.
export function localRecommendationApi(env: Record<string, string>): Plugin {
  return { name: 'local-recommendation-api', configureServer(server) {
    server.middlewares.use('/api/recommendations', async (req, res) => {
      const chunks: Uint8Array[] = []; let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 8192) { res.writeHead(413, { 'Cache-Control': 'no-store' }); res.end(); return; } chunks.push(chunk); }
      const body = Buffer.concat(chunks);
      const request = new Request('http://localhost/api/recommendations', { method: req.method, headers: { 'Content-Type': String(req.headers['content-type'] ?? '') }, ...(req.method === 'POST' ? { body } : {}) });
      const response = await worker.fetch(request, { RECOMMENDATION_MODE: env.VITE_RECOMMENDATION_MODE === 'gemini' ? 'gemini' : 'demo', GEMINI_API_KEY: env.GEMINI_API_KEY });
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text());
    });
  } };
}
