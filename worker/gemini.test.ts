// @vitest-environment node
import { afterEach, expect, test, vi } from 'vitest';
import worker from './index';
const body = { mode: 'auto', style: '', note: '쉽게 손질', conditions: { '희망 길이': '단발', '펌': '생머리', '앞머리': '없음', '현재 모질': '직모', '하루 손질 시간': '5분 이내' } };
const req = (consent = false) => new Request('http://localhost/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, externalConsent: consent }) });
const env = { RECOMMENDATION_MODE: 'gemini', GEMINI_API_KEY: 'test-key' };
afterEach(() => vi.unstubAllGlobals());
test('외부 제공 동의 없이는 Google에 요청하지 않는다', async () => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  expect((await worker.fetch(req(), env)).status).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
});
test('Gemini 응답을 검증하고 Gemini 결과로 반환한다', async () => {
  const styles = ['a', 'b', 'c'].map(id => ({ id, name: `스타일 ${id}`, description: '설명', maintenance: '5분', salonTip: '상담' }));
  const fetch = vi.fn().mockResolvedValue(Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ styles }) }] } }] })); vi.stubGlobal('fetch', fetch);
  const response = await worker.fetch(req(true), env);
  expect(response.status).toBe(200);
  expect((await response.json() as any).source).toBe('gemini');
  const [url, init] = fetch.mock.calls[0];
  expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent');
  expect(init.headers['x-goog-api-key']).toBe('test-key');
  expect(init.body).not.toContain('test-key');
  expect(JSON.parse(init.body).contents[0].parts).toHaveLength(1);
});
test('공급자 오류는 내부 세부정보 없이 실패로 반환하며 예시로 바꾸지 않는다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('secret upstream info', { status: 429 })));
  const response = await worker.fetch(req(true), env);
  expect(response.status).toBe(502);
  expect(await response.text()).not.toContain('secret');
});
test('잘못된 Gemini 출력은 성공으로 표시하지 않는다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ candidates: [{ content: { parts: [{ text: '{"styles":[]}' }] } }] })));
  expect((await worker.fetch(req(true), env)).status).toBe(502);
});
