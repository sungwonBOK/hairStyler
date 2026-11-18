// @vitest-environment node
import { expect, test } from 'vitest';
import { editHairstyle } from './edit-hairstyle';
import type { EditHairstyleInput, HairstyleAdapter, ImageProvider } from './types';
const photo = { bytes: new Uint8Array([1, 2]), mimeType: 'image/png' as const };
const input: EditHairstyleInput = { photo, style: '보브컷' };
test.each(['google', 'fal', 'openai'] as ImageProvider[])('선택한 %s 어댑터만 호출하고 결과를 공통 형식으로 반환한다', async provider => {
  const called: string[] = [];
  const adapter = (name: string): HairstyleAdapter => ({ async edit(value, ctx) { called.push(name); expect(value.style).toBe('보브컷'); expect(ctx.model).toBe('selected-model'); return photo; } });
  const result = await editHairstyle(input, { provider, model: 'selected-model', adapters: { google: adapter('google'), fal: adapter('fal'), openai: adapter('openai') } });
  expect(called).toEqual([provider]); expect(result).toEqual({ image: photo, provider, model: 'selected-model' });
});
test('설정되지 않은 업체를 다른 업체로 몰래 대체하지 않는다', async () => {
  await expect(editHairstyle(input, { provider: 'fal', model: 'x', adapters: {} })).rejects.toMatchObject({ code: 'PROVIDER_NOT_CONFIGURED' });
});
test('사진이 없으면 외부 호출 전에 거절한다', async () => {
  await expect(editHairstyle({ ...input, photo: { ...photo, bytes: new Uint8Array() } }, { provider: 'google', model: 'x', adapters: {} })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
});
test('업체 오류에 포함된 키나 내부 응답을 노출하지 않는다', async () => {
  await expect(editHairstyle(input, { provider: 'google', model: 'x', adapters: { google: { async edit() { throw new Error('secret-key'); } } } })).rejects.toMatchObject({ code: 'PROVIDER_FAILED', message: 'PROVIDER_FAILED' });
});
