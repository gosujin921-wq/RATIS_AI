import { cx } from './util'
import './ProgressBar.css'

/** 진행률 막대. 트랙 gray-10 + 바 primary-45. */
export function ProgressBar({
  value,
  size = 'md',
  label,
  className,
}: {
  /** 0~100 */
  value: number
  /** sm=6px 목록 안 / md=8px 기본 */
  size?: 'sm' | 'md'
  /** 스크린리더용 설명 */
  label?: string
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cx('klid-progress', className)}
      data-size={size}
    >
      <div className="bar" style={{ width: `${pct}%` }} />
    </div>
  )
}
