import { Pagination, type PaginationProps } from '../ui/Pagination'
import { useMediaQuery } from './useMediaQuery'

/**
 * 목록 아래 쪽 넘김 줄 — **화면 폭에 맞춰 번호 수를 정한다.**
 *
 * 넓은 화면  1 … 6 7 8 … 13   (지금 쪽 앞뒤로 하나씩)
 * 휴대폰     1 … 7 … 13       (지금 쪽만)
 *
 * 몇 개를 그릴지는 부품이 정하는 값이라 CSS 로는 줄일 수 없다 — 화살표만 남기는 것과
 * 달리 이건 여기서 해야 한다. 앞뒤를 접지 않으면 390 폭에서 줄이 넘친다.
 * 첫 그림은 넓은 화면 모습이다 (useMediaQuery 주석). 기준점 767 은 design.md §9 의 값이다.
 *
 * 부르는 쪽이 직접 `siblingCount` 를 주면 그 값이 이긴다.
 */
export function PageNav(props: PaginationProps) {
  const phone = useMediaQuery('(max-width: 767px)')
  return <Pagination siblingCount={phone ? 0 : 1} {...props} />
}
