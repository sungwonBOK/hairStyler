import { expect, test } from 'vitest';
import { validatePhotoFile } from './usePhotoSelection';

const fileOf = (type: string, size = 1) => new File([new Uint8Array(size)], 'photo', { type });

test.each(['image/jpeg', 'image/png', 'image/webp'])('%s 사진은 받는다', type => {
  expect(validatePhotoFile(fileOf(type))).toBeUndefined();
});

test('이미지가 아닌 파일은 형식 안내를 돌려준다', () => {
  expect(validatePhotoFile(fileOf('image/gif'))).toContain('JPG, PNG, WEBP');
});

test('10MB까지는 받고 넘으면 크기 안내를 돌려준다', () => {
  expect(validatePhotoFile(fileOf('image/png', 10 * 1024 * 1024))).toBeUndefined();
  expect(validatePhotoFile(fileOf('image/png', 10 * 1024 * 1024 + 1))).toContain('10MB');
});
