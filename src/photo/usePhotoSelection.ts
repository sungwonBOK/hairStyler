import { useRef, useState } from 'react';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxBytes = 10 * 1024 * 1024;

/** 파일 선택 창의 accept 속성 값 */
export const photoAccept = allowedTypes.join(',');

export type PhotoState =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'ready'; preview: string; filename: string }
  | { status: 'error'; message: string };

/** 사진으로 쓸 수 없는 파일이면 안내 문구를, 쓸 수 있으면 undefined를 돌려준다. */
export function validatePhotoFile(file: File): string | undefined {
  if (!allowedTypes.includes(file.type)) return 'JPG, PNG, WEBP 사진을 선택해 주세요.';
  if (file.size > maxBytes) return '10MB 이하의 사진을 선택해 주세요.';
  return undefined;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('FILE_READ_FAILED'));
    reader.readAsDataURL(file);
  });
}

// 확장자만 이미지이고 실제로는 깨진 파일인 경우를 걸러낸다.
function ensureDecodable(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('IMAGE_DECODE_FAILED'));
    image.src = src;
  });
}

/** 사용자가 고른 사진을 검증하고 미리보기용으로 읽어 둔다. 사진은 브라우저 메모리에만 있다. */
export function usePhotoSelection() {
  const [photo, setPhoto] = useState<PhotoState>({ status: 'empty' });
  // 사진을 연달아 고르거나 읽는 중에 삭제하면, 마지막 동작만 반영한다.
  const latestRequest = useRef(0);

  async function select(file: File) {
    const requestId = ++latestRequest.current;
    const isLatest = () => requestId === latestRequest.current;

    const problem = validatePhotoFile(file);
    if (problem) {
      setPhoto({ status: 'error', message: problem });
      return;
    }

    setPhoto({ status: 'loading' });
    try {
      const preview = await readAsDataUrl(file);
      await ensureDecodable(preview);
      if (isLatest()) setPhoto({ status: 'ready', preview, filename: file.name });
    } catch {
      if (isLatest()) setPhoto({ status: 'error', message: '사진을 읽을 수 없어요. 다른 사진을 선택해 주세요.' });
    }
  }

  function remove() {
    latestRequest.current++;
    setPhoto({ status: 'empty' });
  }

  return { photo, select, remove };
}
