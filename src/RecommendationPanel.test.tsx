import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecommendationPanel from './RecommendationPanel';
import { PreviewProvider } from './PreviewProvider';
import { demoRecommendations } from '../worker/demo';
import type { RecommendationDraft } from './recommendations';
const draft: RecommendationDraft = { mode: 'auto', style: '', note: '', conditions: { '희망 길이': '단발', '펌': '생머리', '앞머리': '없음', '현재 모질': '직모', '하루 손질 시간': '5분 이내' } };
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
test('예시 결과를 표시하고 선택한 스타일만 다음 준비 내용에 담는다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(demoRecommendations(draft))));
  render(<PreviewProvider><RecommendationPanel draft={draft} onBack={() => {}} /></PreviewProvider>);
  await userEvent.click(screen.getByRole('button', { name: '예시 추천 불러오기' }));
  await screen.findByText('클래식 보브컷');
  expect(screen.getByText(/얼굴을 분석한 AI 결과가 아니에요/)).toBeTruthy();
  expect((screen.getByRole('button', { name: '선택한 스타일 확인' }) as HTMLButtonElement).disabled).toBe(true);
  await userEvent.click(screen.getByRole('radio', { name: /태슬 단발/ }));
  await userEvent.click(screen.getByRole('button', { name: '선택한 스타일 확인' }));
  expect(screen.getByRole('heading', { name: '태슬 단발' })).toBeTruthy();
});
test('서버 오류를 안내하고 재시도할 수 있다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(null, { status: 503 })).mockResolvedValueOnce(Response.json(demoRecommendations(draft))));
  render(<PreviewProvider><RecommendationPanel draft={draft} onBack={() => {}} /></PreviewProvider>);
  await userEvent.click(screen.getByRole('button', { name: '예시 추천 불러오기' }));
  expect((await screen.findByRole('alert')).textContent).toContain('아직 연결되지');
  await userEvent.click(screen.getByRole('button', { name: '다시 시도하기' }));
  await waitFor(() => expect(screen.getAllByRole('radio')).toHaveLength(3));
});
