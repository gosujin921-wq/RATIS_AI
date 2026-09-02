/**
 * KLID_Portal 의 mocks/samples 대응 심(shim). Card·ResultCard 가 썸네일 폴백으로
 * 참조하는 API 만 같은 시그니처로 제공한다. RATIS 는 CCTV 더미 사진이 필요 없어
 * 중립 플레이스홀더 SVG 하나로 대신한다.
 */

export const DUMMY_ALT = '예시 이미지'

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#ECF2FE"/><path d="M240 260l60-80 50 60 40-30 70 50H240z" fill="#B1CEFB"/><circle cx="270" cy="150" r="24" fill="#B1CEFB"/></svg>`,
  )

export function dummyImage(_seed = '', _index?: number) {
  return PLACEHOLDER
}
