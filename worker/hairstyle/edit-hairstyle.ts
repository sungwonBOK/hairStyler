import type { EditContext, EditHairstyleInput, EditHairstyleResult } from './types.ts';
export class HairstyleError extends Error {
  constructor(public readonly code: 'INVALID_INPUT' | 'PROVIDER_NOT_CONFIGURED' | 'PROVIDER_FAILED' | 'INVALID_OUTPUT' | 'CANCELLED') { super(code); }
}
export async function editHairstyle(input: EditHairstyleInput, context: EditContext): Promise<EditHairstyleResult> {
  const validImage = (image: EditHairstyleInput['photo'], limit: number) => image && image.bytes instanceof Uint8Array && image.bytes.byteLength > 0 && image.bytes.byteLength <= limit && ['image/jpeg', 'image/png', 'image/webp'].includes(image.mimeType);
  if (!validImage(input.photo, 10 * 1024 * 1024) || typeof input.style !== 'string' || !input.style.trim() || input.style.length > 150 || (input.instructions !== undefined && (typeof input.instructions !== 'string' || input.instructions.length > 500)) || !context.model?.trim()) throw new HairstyleError('INVALID_INPUT');
  if (context.signal?.aborted) throw new HairstyleError('CANCELLED');
  const adapter = context.adapters[context.provider];
  if (!adapter) throw new HairstyleError('PROVIDER_NOT_CONFIGURED');
  const signal = AbortSignal.any([AbortSignal.timeout(90000), ...(context.signal ? [context.signal] : [])]);
  let image: EditHairstyleResult['image'];
  try { image = await adapter.edit({ ...input, style: input.style.trim(), instructions: input.instructions?.trim() }, { model: context.model, signal }); }
  catch { throw new HairstyleError(signal.aborted ? 'CANCELLED' : 'PROVIDER_FAILED'); }
  if (signal.aborted) throw new HairstyleError('CANCELLED');
  if (!validImage(image, 20 * 1024 * 1024)) throw new HairstyleError('INVALID_OUTPUT');
  return { image, provider: context.provider, model: context.model };
}
