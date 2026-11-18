import { useState } from 'react';
import RecommendationPanel from './RecommendationPanel';
import { Portrait, Sparkle } from './icons';
import { usePhotoSelection } from './photo/usePhotoSelection';
import { createInitialDraft, type RecommendationDraft } from './recommendations';
import PhotoStep from './steps/PhotoStep';
import PreferenceStep from './steps/PreferenceStep';
import SummaryStep from './steps/SummaryStep';

// 화면 단계는 4개지만 상단 표시는 3칸이다. 입력 요약은 '취향 입력' 칸에 속한다.
type Step = 'photo' | 'preference' | 'summary' | 'style';
const stepLabels = ['사진 준비', '취향 입력', '스타일 선택'];
const stepIndicator: Record<Step, number> = { photo: 1, preference: 2, summary: 2, style: 3 };

export default function App() {
  const [step, setStep] = useState<Step>('photo');
  const [draft, setDraft] = useState<RecommendationDraft>(createInitialDraft);
  const { photo, select: selectPhoto, remove: removePhoto } = usePhotoSelection();

  function go(next: Step) { setStep(next); window.scrollTo(0, 0); }
  function updateDraft(changes: Partial<RecommendationDraft>) { setDraft(current => ({ ...current, ...changes })); }

  return <div className="app">
    <header className="header"><a className="brand" href="/" aria-label="헤어핏 처음으로"><span className="brand-icon"><Sparkle /></span>헤어핏<span className="brand-en">HAIR FIT</span></a><span className="preview-badge">만나보기 · 2차 미리보기</span></header>
    <main className="layout">
      <aside className="intro"><span className="eyebrow">미용실 가기 전, 헤어핏</span><h1>바꾸기 전에,<br/>나에게 먼저<br/><span>입혀보세요.</span></h1><p>나다운 스타일을 찾는 가장 쉬운 방법.<br/>사진 한 장으로 시작하는 헤어스타일 탐색.</p><div className="intro-art"><Portrait /><span className="art-label"><Sparkle />새로운 나를 발견하는 시간</span></div><div className="intro-foot"><span>01 사진 한 장</span><i/><span>02 나의 취향</span><i/><span>03 새로운 스타일</span></div></aside>
      <section className="workspace" aria-label="헤어스타일 준비">
        <StepIndicator current={stepIndicator[step]} />
        {step === 'photo' && <PhotoStep
          photo={photo}
          onSelect={file => void selectPhoto(file)}
          onRemove={removePhoto}
          onNext={() => go('preference')}
        />}
        {step === 'preference' && <PreferenceStep
          draft={draft}
          onChange={updateDraft}
          onBack={() => go('photo')}
          onNext={() => go('summary')}
        />}
        {step === 'summary' && <SummaryStep
          photoPreview={photo.status === 'ready' ? photo.preview : undefined}
          draft={draft}
          onNext={() => go('style')}
          onEdit={() => go('preference')}
          onRestart={() => { removePhoto(); go('photo'); }}
        />}
        {step === 'style' && <RecommendationPanel draft={draft} onBack={() => go('preference')} />}
      </section>
    </main>
    <footer className="footer">HAIR FIT <span>나에게 어울리는 변화의 시작</span></footer>
  </div>;
}

function StepIndicator({ current }: { current: number }) {
  return <ol className="steps">{stepLabels.map((label, i) => {
    const position = i + 1;
    const isCurrent = position === current;
    const isDone = position < current;
    return <li key={label} className={isCurrent ? 'current' : isDone ? 'done' : ''} aria-current={isCurrent ? 'step' : undefined}><span>{isDone ? '✓' : `0${position}`}</span>{label}</li>;
  })}</ol>;
}
