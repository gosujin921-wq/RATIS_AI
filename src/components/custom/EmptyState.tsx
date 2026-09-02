import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cx } from './util'
import './EmptyState.css'

/**
 * 결과·목록이 비었을 때. (기준: design.md §5 빈 상태)
 *
 * size 규칙
 *   md (기본)  페이지 본문 영역. 세로 80 + 아이콘
 *   sm         카드·패널 안. 세로 56
 *   xs         표 안(td)·좁은 사이드 패널. 세로 24, 표면·아이콘 없음
 */
export function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
  size = 'md',
  className,
}: {
  icon?: LucideIcon
  title: string
  desc?: ReactNode
  action?: ReactNode
  size?: 'md' | 'sm' | 'xs'
  className?: string
}) {
  if (size === 'xs') {
    return (
      <div className={cx('klid-empty-state', className)} data-size="xs">
        {title}
        {desc && <span className="desc">{desc}</span>}
        {action && <div className="action">{action}</div>}
      </div>
    )
  }
  return (
    <div className={cx('klid-empty-state', className)} data-size={size}>
      {Icon && <Icon className="icon" aria-hidden />}
      <p className="title">{title}</p>
      {desc && <p className="desc">{desc}</p>}
      {action && <div className="action">{action}</div>}
    </div>
  )
}
