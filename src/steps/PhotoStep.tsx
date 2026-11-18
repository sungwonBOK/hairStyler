import { useRef } from 'react';
import { Button } from '@toss/tds-mobile';
import { PhotoPlaceholder } from '../icons';
import { photoAccept, type PhotoState } from '../photo/usePhotoSelection';

type Props = {
  photo: PhotoState;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onNext: () => void;
};

export default function PhotoStep({ photo, onSelect, onRemove, onNext }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const openFilePicker = () => fileInput.current?.click();
  const loading = photo.status === 'loading';

  return <>
    <div className="section-title"><span className="eyebrow">STEP 01</span><h2>어떤 모습에서 시작할까요?</h2><p>얼굴이 잘 보이는 정면 사진을 준비해 주세요.</p></div>

    <div className={`upload-area ${photo.status === 'ready' ? 'has-photo' : ''}`}>
      {photo.status === 'ready'
        ? <><img className="photo-preview" src={photo.preview} alt="선택한 내 사진"/><span className="photo-tag">내 사진</span></>
        : <>
          <div className="upload-icon"><PhotoPlaceholder /></div>
          <strong>{loading ? '사진을 확인하고 있어요' : '나의 첫 번째 사진'}</strong>
          <p>꾸미지 않은 지금 모습도 좋아요</p>
          <Button size="medium" onClick={openFilePicker} disabled={loading}>사진 선택하기</Button>
          <small>JPG, PNG, WEBP · 최대 10MB</small>
        </>}
    </div>

    <input
      ref={fileInput}
      className="sr-only"
      type="file"
      accept={photoAccept}
      aria-label="내 사진 선택"
      onChange={e => {
        const file = e.target.files?.[0];
        if (file) onSelect(file);
        e.target.value = ''; // 같은 파일을 다시 골라도 onChange가 실행되도록 비운다.
      }}
    />

    {photo.status === 'ready' && <div className="photo-actions"><span>{photo.filename}</span><button onClick={openFilePicker}>다시 선택</button><button onClick={onRemove}>삭제</button></div>}
    {photo.status === 'error' && <p className="error" role="alert">{photo.message}</p>}

    <div className="tips"><strong>이런 사진이면 더 좋아요</strong><div><span>✓ 밝은 곳에서 찍은 정면</span><span>✓ 얼굴과 머리 전체가 보이게</span><span>✓ 모자·선글라스 없이</span></div></div>
    <p className="privacy">지금 선택한 사진은 이 브라우저에서만 사용해요.<br/>서버 저장이나 외부 AI 전송은 하지 않아요.</p>
    <div className="bottom-action"><Button size="large" display="block" disabled={photo.status !== 'ready'} onClick={onNext}>이 사진으로 시작하기</Button></div>
  </>;
}
