export const conditionOptions = {
  '희망 길이': ['상관없어요', '숏', '단발', '미디엄', '롱'],
  '펌': ['상관없어요', '생머리', '자연스러운 컬', '또렷한 컬'],
  '앞머리': ['상관없어요', '있음', '없음'],
  '현재 모질': ['잘 모르겠어요', '직모', '반곱슬', '곱슬'],
  '하루 손질 시간': ['5분 이내', '10분 정도', '충분히 가능해요'],
};
export type Conditions = Record<keyof typeof conditionOptions, string>;
export type RecommendationDraft = { mode: 'auto' | 'direct'; style: string; note: string; conditions: Conditions; externalConsent?: boolean };
export type HairStyle = { id: string; name: string; description: string; maintenance: string; salonTip: string };
export type RecommendationResult = { source: 'demo' | 'gemini'; styles: HairStyle[] };
// 처음 화면에서는 자동 추천 모드이고, 각 조건은 첫 번째 선택지로 시작한다.
export function createInitialDraft(): RecommendationDraft {
  const conditions = Object.fromEntries(Object.entries(conditionOptions).map(([key, values]) => [key, values[0]])) as Conditions;
  return { mode: 'auto', style: '', note: '', conditions };
}
export function parseDraft(value: unknown): RecommendationDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('입력 내용을 확인해 주세요.');
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some(k => !['mode', 'style', 'note', 'conditions', 'externalConsent'].includes(k)) || (v.externalConsent !== undefined && typeof v.externalConsent !== 'boolean') || !['auto', 'direct'].includes(v.mode as string) || typeof v.style !== 'string' || v.style.length > 150 || typeof v.note !== 'string' || v.note.length > 500 || !v.conditions || typeof v.conditions !== 'object' || Array.isArray(v.conditions)) throw new Error('입력 내용을 확인해 주세요.');
  const c = v.conditions as Record<string, unknown>;
  if (Object.keys(c).length !== Object.keys(conditionOptions).length || Object.entries(conditionOptions).some(([key, values]) => !values.includes(c[key] as string)) || (v.mode === 'direct' && !v.style.trim())) throw new Error('입력 내용을 확인해 주세요.');
  return { mode: v.mode as RecommendationDraft['mode'], style: v.mode === 'direct' ? v.style.trim() : '', note: v.note.trim(), conditions: { ...c } as Conditions, ...(v.externalConsent === true ? { externalConsent: true } : {}) };
}
export function parseResult(value: unknown, mode: RecommendationDraft['mode']): RecommendationResult {
  const v = value as RecommendationResult | null;
  const keys = ['id', 'name', 'description', 'maintenance', 'salonTip'] as const;
  if (!v || !['demo', 'gemini'].includes(v.source) || !Array.isArray(v.styles) || v.styles.length !== (mode === 'auto' ? 3 : 1) || v.styles.some(s => !s || keys.some(k => typeof s[k] !== 'string' || !s[k].trim() || s[k].length > 700)) || new Set(v.styles.map(s => s.id)).size !== v.styles.length) throw new Error('추천 결과를 읽을 수 없어요. 다시 시도해 주세요.');
  return v;
}
export async function requestRecommendations(draft: RecommendationDraft, signal: AbortSignal): Promise<RecommendationResult> {
  const response = await fetch(import.meta.env.VITE_RECOMMENDATION_API_URL || '/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parseDraft(draft)), signal, cache: 'no-store' });
  if (!response.ok) throw new Error(response.status === 503 ? '추천 서버가 아직 연결되지 않았어요. 잠시 후 다시 시도해 주세요.' : '추천을 불러오지 못했어요. 다시 시도해 주세요.');
  return parseResult(await response.json(), draft.mode);
}
