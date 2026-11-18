import { Button } from '@toss/tds-mobile';
import type { RecommendationDraft } from '../recommendations';

type Props = {
  photoPreview?: string;
  draft: RecommendationDraft;
  onNext: () => void;
  onEdit: () => void;
  onRestart: () => void;
};

export default function SummaryStep({ photoPreview, draft, onNext, onEdit, onRestart }: Props) {
  const { mode, style, note, conditions } = draft;
  const live = import.meta.env.VITE_RECOMMENDATION_MODE === 'gemini';

  return <>
    <div className="section-title"><span className="eyebrow">STEP 03</span><h2>준비한 내용을 확인해 주세요</h2><p>내 사진과 취향이 잘 담겼나요?</p></div>

    <div className="summary-photo">
      <img src={photoPreview} alt="입력 확인용 내 사진"/>
      <div><strong>{mode === 'auto' ? 'AI 자동 추천' : '직접 스타일 지정'}</strong><p>{mode === 'auto' ? '내 조건에 맞는 스타일 3개 추천 예정' : style}</p></div>
    </div>

    <dl className="summary">
      {Object.entries(conditions).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
      {note.trim() && <div><dt>추가 요청</dt><dd>{note}</dd></div>}
    </dl>

    <div className="checkpoint">
      <span className="checkpoint-label">{live ? '입력한 취향으로 찾아봐요' : '예시로 미리 살펴보세요'}</span>
      <h3>이 조건으로 스타일을 찾아볼까요?</h3>
      <p>{live ? '다음 화면에서 동의하면 조건과 추가 요청을 Google에 전송해요. 사진은 보내지 않아요.' : '지금은 예시 스타일을 보여드려요. 사진을 분석하거나 외부 AI로 전송하지 않아요.'}</p>
    </div>

    <div className="bottom-action">
      <Button size="large" display="block" onClick={onNext}>스타일 선택으로</Button>
      <button className="text-button" onClick={onEdit}>입력 내용 수정하기</button>
      <button className="text-button" onClick={onRestart}>사진 삭제하고 처음으로</button>
    </div>
  </>;
}
