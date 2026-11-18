import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { PreviewProvider } from './PreviewProvider';

function renderApp() { return render(<PreviewProvider><App /></PreviewProvider>); }

function currentStepLabel() { return document.querySelector('[aria-current="step"]')?.textContent; }

// jsdom은 이미지를 실제로 디코딩하지 않으므로 로드 성공만 흉내 낸다.
class LoadingImage {
  onload?: () => void;
  set src(_: string) { setTimeout(() => this.onload?.()); }
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test('사진 선택부터 스타일 선택 화면까지 입력한 내용이 이어진다', async () => {
  vi.stubGlobal('Image', LoadingImage);
  renderApp();
  const user = userEvent.setup();

  await user.upload(screen.getByLabelText('내 사진 선택'), new File(['photo'], 'me.png', { type: 'image/png' }));
  await user.click(await screen.findByRole('button', { name: '이 사진으로 시작하기' }));
  expect(currentStepLabel()).toContain('취향 입력');

  await user.click(screen.getByRole('button', { name: /직접 지정/ }));
  await user.type(screen.getByLabelText(/원하는 헤어스타일/), '태슬 단발');
  await user.click(screen.getByRole('button', { name: '단발' }));
  await user.click(screen.getByRole('button', { name: '입력 내용 확인하기' }));

  expect(screen.getByText('직접 스타일 지정')).toBeTruthy();
  expect(screen.getByText('태슬 단발')).toBeTruthy();
  expect(screen.getByText('단발')).toBeTruthy();
  expect(currentStepLabel()).toContain('취향 입력');

  await user.click(screen.getByRole('button', { name: '스타일 선택으로' }));
  expect(screen.getByRole('heading', { name: '원하는 스타일을 준비해요' })).toBeTruthy();
  expect(currentStepLabel()).toContain('스타일 선택');
});

test('사진 없이 다음 단계로 이동할 수 없다', () => {
  renderApp();
  expect((screen.getByRole('button', { name: '이 사진으로 시작하기' }) as HTMLButtonElement).disabled).toBe(true);
});

test('지원하지 않는 파일을 선택하면 안내하고 진행을 막는다', async () => {
  renderApp();
  const user = userEvent.setup({ applyAccept: false });
  await user.upload(screen.getByLabelText('내 사진 선택'), new File(['text'], 'memo.txt', { type: 'text/plain' }));
  expect(screen.getByRole('alert').textContent).toContain('JPG, PNG, WEBP');
  expect((screen.getByRole('button', { name: '이 사진으로 시작하기' }) as HTMLButtonElement).disabled).toBe(true);
});

test('10MB가 넘는 사진은 거절한다', async () => {
  renderApp();
  await userEvent.upload(screen.getByLabelText('내 사진 선택'), new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.jpg', { type: 'image/jpeg' }));
  expect(screen.getByRole('alert').textContent).toContain('10MB');
});
