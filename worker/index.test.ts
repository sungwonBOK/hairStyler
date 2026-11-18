// @vitest-environment node
import { expect, test } from 'vitest';
import worker from './index';

const draft = { mode: 'auto', style: '', note: '', conditions: { '희망 길이': '단발', '펌': '생머리', '앞머리': '없음', '현재 모질': '직모', '하루 손질 시간': '5분 이내' } };
function request(body: unknown) { return new Request('http://localhost/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
test('예시 자동 추천은 구분 표시와 서로 다른 스타일 3개를 반환한다', async () => {
  const response = await worker.fetch(request(draft), { RECOMMENDATION_MODE: 'demo' });
  expect(response.status).toBe(200);
  const result = await response.json() as any;
  expect(result.source).toBe('demo');
  expect(result.styles).toHaveLength(3);
  expect(new Set(result.styles.map((s: any) => s.id)).size).toBe(3);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
});
test('직접 지정은 입력한 스타일 1개를 반환한다', async () => {
  const response = await worker.fetch(request({ ...draft, mode: 'direct', style: '가벼운 보브컷' }), { RECOMMENDATION_MODE: 'demo' });
  expect(response.status).toBe(200);
  const result = await response.json() as any;
  expect(result.styles).toHaveLength(1);
  expect(result.styles[0].name).toBe('가벼운 보브컷');
});
test.each([{ ...draft, mode: 'unknown' }, { ...draft, mode: 'direct', style: '  ' }, { ...draft, note: 'a'.repeat(501) }, { ...draft, conditions: {} }, { ...draft, photo: 'sensitive-image' }])('잘못되거나 허용하지 않은 입력을 거절한다', async body => {
  expect((await worker.fetch(request(body), { RECOMMENDATION_MODE: 'demo' })).status).toBe(400);
});
test('AI 설정이 없으면 예시 응답으로 몰래 대체하지 않는다', async () => {
  expect((await worker.fetch(request(draft), {})).status).toBe(503);
});
test('잘못된 JSON은 서버 오류 대신 400을 반환한다', async () => {
  const response = await worker.fetch(new Request('http://localhost/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }), { RECOMMENDATION_MODE: 'demo' });
  expect(response.status).toBe(400);
});

test('허용한 앱 출처의 사전 요청에만 CORS 응답을 준다', async () => {
  const request = new Request('http://localhost/api/recommendations', { method: 'OPTIONS', headers: { Origin: 'https://app.example' } });
  const response = await worker.fetch(request, { ALLOWED_ORIGIN: 'https://app.example' });
  expect(response.status).toBe(204);
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example');
});
test('허용되지 않은 출처에서는 호출할 수 없다', async () => {
  const request = new Request('http://localhost/api/recommendations', { method: 'OPTIONS', headers: { Origin: 'https://other.example' } });
  expect((await worker.fetch(request, { ALLOWED_ORIGIN: 'https://app.example' })).status).toBe(403);
});
