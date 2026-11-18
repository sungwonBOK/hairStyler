import { useEffect, useRef, useState } from 'react';
import { Button } from '@toss/tds-mobile';
import { requestRecommendations, type RecommendationDraft, type RecommendationResult } from './recommendations';

export default function RecommendationPanel({ draft, onBack }: { draft: RecommendationDraft; onBack: () => void }) {
  const live = import.meta.env.VITE_RECOMMENDATION_MODE === 'gemini';
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<RecommendationResult>();
  const [selected, setSelected] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const active = useRef<AbortController>();
  useEffect(() => () => active.current?.abort(), []);
  async function load() {
    if (active.current || (live && !consent)) return;
    const controller = new AbortController(); active.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 15000);
    setLoading(true); setError(''); setSelected(''); setConfirmed(false); setResult(undefined);
    try {
      const next = await requestRecommendations({ ...draft, externalConsent: live && consent }, controller.signal);
      if (next.source !== (live ? 'gemini' : 'demo')) throw new Error('추천 환경이 변경됐어요. 새로고침 후 다시 시도해 주세요.');
      setResult(next);
    }
    catch (e) { setError(controller.signal.aborted ? '응답이 지연되고 있어요. 다시 시도해 주세요.' : e instanceof Error ? e.message : '추천을 불러오지 못했어요.'); }
    finally { window.clearTimeout(timer); active.current = undefined; setLoading(false); }
  }
  const choice = result?.styles.find(s => s.id === selected);
  return <div className="recommendation-panel">
    <div className="section-title"><span className="eyebrow">STYLE PICK</span><h2>{confirmed ? '이 스타일로 준비했어요' : draft.mode === 'auto' ? '마음에 드는 스타일을 골라요' : '원하는 스타일을 준비해요'}</h2><p>{confirmed ? '다음 단계에서 내 사진에 적용할 예정이에요.' : '설명을 비교하며 나의 취향을 찾아보세요.'}</p></div>
    <div className="demo-notice"><strong>{live ? 'Gemini 취향 기반 추천' : '예시 추천 미리보기'}</strong><p>{live ? '입력한 조건과 추가 요청으로 추천해요. 사진과 얼굴은 아직 분석하지 않아요. AI 설명은 미용실 상담 시 참고해 주세요.' : '얼굴을 분석한 AI 결과가 아니에요. 입력한 길이에 맞춘 예시로 선택 과정을 체험해 보세요. 사진은 전송하지 않아요.'}</p></div>
    {live && !result && <label className="consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} disabled={loading}/><span>스타일 추천을 위해 입력한 조건·추가 요청을 Google Gemini API에 전송하는 데 동의해요. 사진은 보내지 않아요. <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">Google API 이용 조건</a></span></label>}
    {!result && <div className="recommendation-start"><span className="start-symbol" aria-hidden="true">✧</span><h3>{draft.mode === 'auto' ? '나의 스타일 후보 3개' : draft.style}</h3><p>이미지는 선택을 마친 뒤 한 장만 생성해요.<br/>{live ? '실제 AI 호출에는 API 사용료가 발생할 수 있어요.' : '이번 예시 미리보기에서는 비용이 발생하지 않아요.'}</p><Button size="large" display="block" disabled={loading || (live && !consent)} onClick={() => void load()}>{loading ? '스타일을 불러오고 있어요…' : error ? '다시 시도하기' : live ? 'AI 추천 받기' : '예시 추천 불러오기'}</Button></div>}
    {loading && <p className="request-status" role="status">스타일 정보를 확인하고 있어요.</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {result && !confirmed && <><div className="style-cards" role="radiogroup" aria-label="스타일 선택">{result.styles.map((s, i) => <label className={`style-card ${selected === s.id ? 'selected' : ''}`} key={s.id}><input type="radio" name="hair-style" checked={selected === s.id} onChange={() => setSelected(s.id)}/><span className="style-number">STYLE 0{i + 1}</span><strong>{s.name}</strong><p>{s.description}</p><span className="style-meta">손질 · {s.maintenance}</span><details onClick={e => e.stopPropagation()}><summary>미용실에서 물어볼 점</summary><p>{s.salonTip}</p></details></label>)}</div><div className="bottom-action"><Button size="large" display="block" disabled={!choice} onClick={() => setConfirmed(true)}>선택한 스타일 확인</Button></div></>}
    {confirmed && choice && <><div className="chosen-style"><span className="eyebrow">MY PICK</span><h3>{choice.name}</h3><p>{choice.description}</p><div className="salon-note"><strong>미용실 상담 메모</strong><p>{choice.salonTip}</p>{draft.note && <p>나의 요청: {draft.note}</p>}</div></div><div className="checkpoint"><span className="checkpoint-label">두 번째 확인 지점</span><h3>스타일 선택까지 준비됐어요</h3><p>이미지 생성은 다음 작업에서 연결해요. 지금은 선택한 스타일과 상담 메모를 확인할 수 있어요.</p></div><button className="text-button" onClick={() => setConfirmed(false)}>다른 스타일 고르기</button></>}
    <button className="text-button" onClick={() => { active.current?.abort(); onBack(); }}>취향 다시 입력하기</button>
  </div>;
}

