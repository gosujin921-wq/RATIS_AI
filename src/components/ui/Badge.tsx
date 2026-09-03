import type { ReactNode } from 'react'
import { cx } from '../custom/util'
import './Badge.css'

export type BadgeTone = 'gray' | 'brand' | 'info' | 'success' | 'warning' | 'danger'
export type BadgeVariant = 'tint' | 'solid' | 'outline'
export type BadgeSize = 'sm' | 'md'

/**
 * 상태·갈래를 한 낱말로 말하는 표식. 목록 표의 상태 칸과 갈래 칸이 주로 쓴다.
 *
 * ★ **글자는 어느 tone 이든 먹색이다** (tint 갈래). 색을 글자까지 물들이면 여덟 배지가
 *   여덟 색으로 읽혀 줄이 얼룩진다. 면끼리만 견주게 두면 표를 세로로 훑을 때 글자는
 *   고르게 읽히고 색은 곁눈으로 들어온다. 대비도 여기서 한 번에 해결된다 — 옅은 면 위
 *   먹색이라 tone 이 늘어도 매번 대비를 다시 재지 않는다.
 * ★ **굵기는 500 이다.** 배지는 훑는 표식이지 강조가 아니다. 600 은 버튼·라벨의 급이라
 *   배지가 그 굵기를 들면 표 안에서 누를 수 있는 것처럼 보인다.
 *
 * variant 는 **무게**다.
 *   tint     옅은 면 + 먹색 글자. 기본이자 표 안의 거의 모든 자리
 *   solid    채운 면 + 흰 글자. 화면에 하나뿐인 지금 상태를 말할 때만
 *   outline  선만. 면을 가진 것들 옆에서 「아직 아무것도 아님」을 말하는 자리
 *
 * shape 는 **뜻**이다 (design.md §4).
 *   capsule  상태 — 바뀌는 값
 *   square   갈래 — 바뀌지 않는 분류. 캡슐 옆에 서도 색이 아니라 모양으로 갈린다
 */
export function Badge({
  tone = 'gray',
  variant = 'tint',
  size = 'sm',
  shape = 'capsule',
  children,
  className,
}: {
  tone?: BadgeTone
  variant?: BadgeVariant
  size?: BadgeSize
  shape?: 'capsule' | 'square'
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cx('ratis-badge', className)}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
    >
      {children}
    </span>
  )
}
