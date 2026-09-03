import type { LucideIcon } from 'lucide-react'
import { cx } from './util'
import { href as withBase } from '../../app/basePath'
import './StatCard.css'

/**
 * 통계 KPI 카드 (대시보드·요약 공용).
 * 상단에 라벨(좌) + 아이콘 칩(우), 아래 큰 값, 그 아래 보조 캡션(sub). card-soft 표면.
 * href 가 있으면 링크로 동작한다 (라우터 도입 전이라 a 태그. 도입 시 Link 로 교체).
 */
export function StatCard({
  icon: Icon,
  value,
  unit,
  label,
  sub,
  href,
  className,
}: {
  icon: LucideIcon
  value: number | string
  unit?: string
  label: string
  sub?: string
  href?: string
  className?: string
}) {
  const cls = cx('ratis-stat-card', 'card-soft', className)
  const inner = (
    <>
      <div className="head">
        <p className="label">{label}</p>
        <span className="chip">
          <Icon aria-hidden />
        </span>
      </div>
      <p className="value">
        {value}
        {unit && <span className="unit">{unit}</span>}
      </p>
      {sub && <p className="sub">{sub}</p>}
    </>
  )
  return href ? (
    <a href={withBase(href)} className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  )
}
