import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from '../custom/util'
import './Pagination.css'

export interface PaginationProps {
  /** 전체 쪽수. 1 이하면 줄을 그리지 않는다 */
  totalPages: number
  /** 밖에서 들 때 */
  page?: number
  /** 안에서 들 때의 첫 쪽 */
  defaultPage?: number
  onChange?: (page: number) => void
  /** 지금 쪽 앞뒤로 몇 개를 더 보일지. 좁은 화면은 0 (PageNav 가 정한다) */
  siblingCount?: number
  className?: string
}

/** 말줄임 자리. 숫자가 아니라는 표시로 쓴다 */
const GAP = '…'

/**
 * 몇 쪽을 그릴지 정한다. 양끝(1 · 마지막)은 늘 서고, 지금 쪽 앞뒤로 `sibling` 만큼 붙는다.
 * 그 사이가 벌어지면 말줄임이 들어간다.
 *
 * ★ 말줄임 자리에는 **한 쪽만 건너뛰는 경우가 없다.** 1 … 3 처럼 2 하나를 감추면 누르면 될
 *   것을 감춘 꼴이라, 그럴 때는 말줄임 대신 그 숫자를 그대로 세운다.
 */
function pagesToShow(total: number, current: number, sibling: number): (number | typeof GAP)[] {
  const from = Math.max(2, current - sibling)
  const to = Math.min(total - 1, current + sibling)
  const out: (number | typeof GAP)[] = [1]
  if (from > 2) out.push(from === 3 ? 2 : GAP)
  for (let p = from; p <= to; p++) out.push(p)
  if (to < total - 1) out.push(to === total - 2 ? total - 1 : GAP)
  if (total > 1) out.push(total)
  return out
}

/**
 * 목록 아래 쪽 넘김 줄.
 *
 * ★ **버튼이지 링크가 아니다.** 쪽을 넘기는 일은 이 화면 안에서 목록만 갈리는 일이고,
 *   주소가 바뀌어야 하는 이동이 아니다. 링크로 그리면 누르는 순간 화면이 문서 맨 위로
 *   튀어 보던 자리를 잃는다.
 * ★ 지금 쪽은 `aria-current="page"` 로 말한다 — 색과 면으로만 표시하면 보조기술에는
 *   열두 개의 똑같은 버튼으로 들린다.
 *
 * 좁은 화면에서 번호를 몇 개 세울지는 이 부품이 정하지 않는다 — 짝이 되는
 * `custom/PageNav` 가 화면 폭을 보고 `siblingCount` 를 넘긴다.
 */
export function Pagination({
  totalPages,
  page,
  defaultPage = 1,
  onChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const [inner, setInner] = useState(defaultPage)
  const current = page ?? inner
  if (totalPages <= 1) return null

  const go = (next: number) => {
    const clamped = Math.min(totalPages, Math.max(1, next))
    if (clamped === current) return
    if (page === undefined) setInner(clamped)
    onChange?.(clamped)
  }

  return (
    <nav className={cx('ratis-pagination', className)} aria-label="쪽 넘김">
      <button
        type="button"
        className="ratis-pagination-step"
        onClick={() => go(current - 1)}
        disabled={current === 1}
        aria-label="이전 쪽"
      >
        <ChevronLeft aria-hidden />
      </button>
      <ul className="ratis-pagination-pages">
        {pagesToShow(totalPages, current, siblingCount).map((p, i) =>
          p === GAP ? (
            // 건너뛴 자리. 보조기술에는 읽히지 않아도 되는 모양이다
            <li key={`gap-${i}`} className="ratis-pagination-gap" aria-hidden>
              {GAP}
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                className="ratis-pagination-page"
                aria-current={p === current ? 'page' : undefined}
                onClick={() => go(p)}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ul>
      <button
        type="button"
        className="ratis-pagination-step"
        onClick={() => go(current + 1)}
        disabled={current === totalPages}
        aria-label="다음 쪽"
      >
        <ChevronRight aria-hidden />
      </button>
    </nav>
  )
}
