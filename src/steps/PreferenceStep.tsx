import { Button } from '@toss/tds-mobile';
import { Sparkle } from '../icons';
import { conditionOptions, type Conditions, type RecommendationDraft } from '../recommendations';

type Props = {
  draft: RecommendationDraft;
  onChange: (changes: Partial<RecommendationDraft>) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function PreferenceStep({ draft, onChange, onBack, onNext }: Props) {
  const { mode, style, note, conditions } = draft;
  const setCondition = (key: keyof Conditions, value: string) => onChange({ conditions: { ...conditions, [key]: value } });
  // 직접 지정 모드에서는 원하는 스타일을 적어야 다음으로 넘어갈 수 있다.
  const canProceed = mode === 'auto' || style.trim() !== '';

  return <>
    <div className="section-title"><span className="eyebrow">STEP 02</span><h2>어떤 스타일을 원하세요?</h2><p>취향에 가까울수록, 선택이 쉬워져요.</p></div>

    <div className="mode-tabs" role="group" aria-label="추천 방식">
      <button aria-pressed={mode === 'auto'} onClick={() => onChange({ mode: 'auto' })}><Sparkle/><strong>AI 자동 추천</strong><small>어울리는 스타일을 찾고 싶어요</small></button>
      <button aria-pressed={mode === 'direct'} onClick={() => onChange({ mode: 'direct' })}><span className="mode-pencil">✎</span><strong>직접 지정</strong><small>원하는 스타일이 있어요</small></button>
    </div>

    {mode === 'direct' && <label className="field">원하는 헤어스타일 <span className="required">필수</span><input maxLength={150} placeholder="예: 턱선 길이의 보브컷, 자연스러운 C컬" value={style} onChange={e => onChange({ style: e.target.value })}/></label>}

    <div className="condition-list">
      {(Object.entries(conditionOptions) as [keyof Conditions, string[]][]).map(([key, values]) =>
        <fieldset key={key}>
          <legend>{key}</legend>
          <div className="chips">{values.map(value => <button key={value} aria-pressed={conditions[key] === value} onClick={() => setCondition(key, value)}>{value}</button>)}</div>
        </fieldset>)}
    </div>

    <label className="field">더 알려주고 싶은 점 <span>선택</span><textarea maxLength={500} rows={3} placeholder="예: 아침에 손질이 쉽고, 묶을 수 있으면 좋겠어요." value={note} onChange={e => onChange({ note: e.target.value })}/><small>{note.length}/500</small></label>

    <div className="bottom-action action-row"><button className="back" onClick={onBack}>이전</button><Button size="large" display="block" disabled={!canProceed} onClick={onNext}>입력 내용 확인하기</Button></div>
  </>;
}
