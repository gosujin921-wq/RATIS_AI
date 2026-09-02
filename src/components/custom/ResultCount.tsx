import { cx } from './util'
import './ResultCount.css'

/**
 * 목록 위 결과 건수 줄 ("총 128건").
 * KRDS 에 대응 컴포넌트가 없다. 목록형 화면이 공유한다 (공지사항·FAQ·활용사례·문의하기).
 * 아래 목록과 한 덩어리라 사이 간격은 컴포넌트 내부값 12 를 쓴다 (design.md §6).
 */
export function ResultCount({ total, className }: { total: number; className?: string }) {
  return (
    <p className={cx('klid-result-count', className)}>
      총 <strong>{total.toLocaleString()}</strong>건
    </p>
  )
}
