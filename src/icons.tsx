// 화면 장식용 아이콘. 의미를 전달하지 않으므로 모두 aria-hidden 처리한다.

export function Sparkle() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>;
}

export function Portrait() {
  return <svg className="portrait" viewBox="0 0 240 240" fill="none" aria-hidden="true"><circle cx="120" cy="120" r="113" fill="#EAF2FF"/><path d="M54 208c4-42 30-60 66-60s62 18 66 60" fill="#ADC9FA"/><path d="M75 117c-18-55 7-88 43-88 46 0 67 36 48 94l-10 49H80l-5-55Z" fill="#353D54"/><path d="M103 143h34v28c-9 14-26 14-34 0v-28Z" fill="#F4C9B4"/><ellipse cx="120" cy="105" rx="38" ry="47" fill="#FFDFCC"/><path d="M79 102c-2-47 17-59 42-59 28 0 47 22 41 61-21-4-39-17-49-32-6 17-17 26-34 30Z" fill="#353D54"/><path d="M105 110h1m28 0h1" stroke="#55556C" strokeWidth="5" strokeLinecap="round"/><path d="M113 129c4 3 10 3 14 0" stroke="#C88779" strokeWidth="3" strokeLinecap="round"/><rect x="38" y="42" width="164" height="164" rx="36" stroke="#739AE8" strokeWidth="1.5" strokeDasharray="8 7"/><path d="m190 31 3.5 10 10 3.5-10 3.5-3.5 10-3.5-10-10-3.5 10-3.5 3.5-10Z" fill="#3182F6"/></svg>;
}

export function PhotoPlaceholder() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="5" y="7" width="22" height="19" rx="5" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="13" r="2" fill="currentColor"/><path d="m7 23 6-6 4 4 4-5 5 7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
}
