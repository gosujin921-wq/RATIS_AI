import type { ReactNode } from 'react'
import { cx } from './util'
import './KeyValueList.css'

export type KeyValueItem = {
  label: string
  value: ReactNode
}

/** 라벨·값을 담는 두 가지 꼴 (아래 컴포넌트 주석 참조) */
export type KeyValueLayout = 'rows' | 'cards'

/**
 * 라벨·값 묶음 — 같은 짝(라벨 + 값)을 **두 가지 꼴**로 담는다. 담는 것은 같고 읽는 방식이 다르다.
 *
 *   layout="rows" — 판 한 장 (design.md §5 「두 칸짜리 정보 표」)
 *   ┌──────────────────────────┐      값을 **차례로 읽어 내려가는** 자리.
 *   │  Accuracy         94.2%  │      오른쪽 끝선이 하나라 자릿수·단위가 달라도
 *   │ ──────────────────────── │      눈이 한 줄로 내려오며 다 읽는다.
 *   │  F1-Score          0.91  │      좁은 화면·항목이 많은 자리에 맞는다.
 *   └──────────────────────────┘
 *
 *   layout="cards" — 카드 여러 장
 *   ┌────────┐┌────────┐┌────────┐   값끼리 **크기를 견주는** 자리.
 *   │Accuracy││F1-Score││Precision│   라벨 위 · 값 아래로 쌓아 숫자가 먼저 읽히고,
 *   │  94.2% ││  0.91  ││  0.89   │   넉 장이 나란히 서서 서로 비교된다.
 *   └────────┘└────────┘└────────┘   넓은 화면·항목이 서넛인 자리에 맞는다.
 *
 * KRDS 에 대응 컴포넌트가 없다. 값끼리 크기를 견주되 **아이콘 칩과 캡션까지 거느리는** 자리는
 * StatCard 를 쓴다 — 그쪽은 대시보드 KPI 라 강조 카드(card-soft)다.
 *
 * 면은 두 꼴 모두 공통 구획 카드(.ratis-section-card)를 쓴다 (design.md §5 — 흰 면 · gray-20
 * 보더 · 라운드 16). 면을 갖는 것이 rows 는 판, cards 는 카드 한 장 한 장이다.
 * 판 안에 이미 다른 면이 있어 두 겹이 되는 자리에서는 `surface={false}` 로 면을 끈다.
 */
export function KeyValueList({
  items,
  ariaLabel,
  layout = 'rows',
  surface = true,
  className,
}: {
  items: KeyValueItem[]
  /** 소제목을 달지 않는 자리에서도 보조기술이 읽을 이름은 준다 (design.md §2) */
  ariaLabel?: string
  /** 판 한 장(rows · 기본) 또는 카드 여러 장(cards) */
  layout?: KeyValueLayout
  /** 면(흰 배경 · 보더 · 라운드)을 갖는다. 이미 면 안에 놓이는 자리에서만 끈다 */
  surface?: boolean
  className?: string
}) {
  const cards = layout === 'cards'
  return (
    <dl
      className={cx(
        'ratis-kv-list',
        cards ? 'ratis-kv-cards' : 'ratis-kv-rows',
        !cards && surface && 'ratis-section-card',
        className,
      )}
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <div key={item.label} className={cx('row', cards && surface && 'ratis-section-card')}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
