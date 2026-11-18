import type { RecommendationDraft, RecommendationResult } from '../src/recommendations.ts';
export function demoRecommendations(draft: RecommendationDraft): RecommendationResult {
  if (draft.mode === 'direct') return { source: 'demo', styles: [{ id: 'direct', name: draft.style, description: '직접 입력한 스타일이에요. 실제 시술 가능 여부는 미용사와 상담해 주세요.', maintenance: '스타일과 현재 모질에 따라 달라요', salonTip: '원하는 길이와 컬의 강도를 참고 사진과 함께 전달해 주세요.' }] };
  const length = draft.conditions['희망 길이'];
  const names: Record<string, string[]> = { '숏': ['소프트 픽시컷', '내추럴 숏컷', '숏 레이어드컷'], '단발': ['클래식 보브컷', '태슬 단발', '단발 레이어드컷'], '미디엄': ['미디엄 레이어드컷', '쇄골 기장 원랭스컷', '미디엄 허쉬컷'], '롱': ['롱 레이어드컷', '롱 원랭스컷', '롱 허쉬컷'], '상관없어요': ['클래식 보브컷', '미디엄 레이어드컷', '롱 레이어드컷'] };
  return { source: 'demo', styles: names[length].map((name, i) => ({ id: `demo-${i + 1}`, name, description: ['단정한 실루엣과 깔끔한 라인을 살리는 스타일이에요.', '전체적인 형태를 살려 차분한 분위기를 연출하는 스타일이에요.', '층을 더해 가벼운 움직임을 표현하는 스타일이에요.'][i], maintenance: '모질과 커트 형태에 따라 손질 시간이 달라요', salonTip: `앞머리 ${draft.conditions['앞머리']}, 펌 ${draft.conditions['펌']} 조건을 전달하고 현재 머리 상태에 맞게 상담해 주세요.` })) };
}
