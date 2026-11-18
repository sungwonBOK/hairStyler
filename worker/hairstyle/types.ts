export type ImageProvider = 'google' | 'fal' | 'openai';
export type ImageMime = 'image/jpeg' | 'image/png' | 'image/webp';
export type ImageAsset = { bytes: Uint8Array; mimeType: ImageMime };
export type EditHairstyleInput = {
  photo: ImageAsset;
  style: string;
  instructions?: string;
  // A previous generated image can be used as the next edit's photo.
};
export type EditHairstyleResult = {
  image: ImageAsset;
  provider: ImageProvider;
  model: string;
};
export type AdapterContext = { model: string; signal: AbortSignal };
export interface HairstyleAdapter {
  // Adapter owns vendor prompt, payload, queue/polling, and binary normalization.
  edit(input: EditHairstyleInput, context: AdapterContext): Promise<ImageAsset>;
}
export type EditContext = {
  provider: ImageProvider;
  model: string;
  adapters: Partial<Record<ImageProvider, HairstyleAdapter>>;
  signal?: AbortSignal;
};
