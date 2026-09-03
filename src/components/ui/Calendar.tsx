import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from '../custom/util'
import {
  WEEKDAYS,
  addMonths,
  fromDateString,
  isSameDay,
  monthGrid,
  monthLabel,
  startOfMonth,
  toDateString,
} from './date'
import './Calendar.css'

export interface CalendarRange {
  start: string
  end: string
}

/**
 * 달력 표 — **날을 고르는 일만** 한다.
 *
 * 여닫는 것도, 고른 값을 어디에 적을지도 이 부품의 몫이 아니다. 그건 부르는 쪽(날짜 입력 ·
 * 기간 필터)이 자기 자리에 맞게 정한다. 달력이 자기 버튼과 입력칸까지 데리고 다니면
 * 쓰는 자리마다 그 딸린 것들을 감추고 옮기는 일이 생긴다.
 *
 * mode
 *   single  하루. 누르면 그 자리에서 끝난다
 *   range   기간. 첫 번째 누름이 시작, 두 번째가 끝이다. 끝이 시작보다 앞이면 뒤집어 담는다 —
 *           「거꾸로 골랐습니다」라고 되돌리는 대신 사람이 뜻한 대로 받는다
 *
 * 값은 `YYYY.MM.DD` 글자열로 오간다 (date.ts). 보고 있는 달은 안에서 들되, 값이 밖에서
 * 바뀌면 그 달로 따라간다.
 *
 * 접근성 — 표가 아니라 격자(grid)다. 날짜는 버튼이라 Tab 으로도 닿고, 지금 고른 날은
 * `aria-pressed` 가 말한다. 앞뒤 달의 날은 보이기는 해도 누를 수 없다.
 */
export function Calendar({
  mode = 'single',
  value,
  range,
  onSelect,
  onSelectRange,
  className,
}: {
  mode?: 'single' | 'range'
  /** single 일 때 고른 날 */
  value?: string
  /** range 일 때 고른 기간. 고르는 중이면 end 가 비어 있다 */
  range?: CalendarRange
  onSelect?: (date: string) => void
  onSelectRange?: (range: CalendarRange) => void
  className?: string
}) {
  const anchor = fromDateString(mode === 'range' ? (range?.start ?? '') : (value ?? ''))
  const [month, setMonth] = useState(() => startOfMonth(anchor ?? new Date()))

  const startAt = fromDateString(range?.start ?? '')
  const endAt = fromDateString(range?.end ?? '')
  const pickedAt = fromDateString(value ?? '')
  const today = new Date()

  /* 기간을 고르는 중인가 — 시작만 있고 끝이 없는 상태.
     이때 누르는 날이 끝이 되고, 그 전까지는 새 시작이다 */
  const picking = mode === 'range' && Boolean(startAt) && !endAt

  const choose = (d: Date) => {
    const s = toDateString(d)
    if (mode === 'single') {
      onSelect?.(s)
      return
    }
    if (!picking) {
      onSelectRange?.({ start: s, end: '' })
      return
    }
    /* 거꾸로 골랐으면 뒤집어 담는다 — 사람은 「이 날부터 저 날까지」를 어느 쪽부터든 짚는다 */
    const first = startAt as Date
    onSelectRange?.(d < first ? { start: s, end: toDateString(first) } : { start: toDateString(first), end: s })
  }

  const inRange = (d: Date) => startAt && endAt && d > startAt && d < endAt

  return (
    <div className={cx('ratis-calendar', className)}>
      <div className="ratis-calendar-head">
        <button
          type="button"
          className="ratis-calendar-step"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          aria-label="이전 달"
        >
          <ChevronLeft aria-hidden />
        </button>
        {/* 달이 바뀌면 읽어 준다 — 화살표만 누르고 있으면 어느 달인지 눈으로만 알 수 있다 */}
        <strong className="ratis-calendar-month" aria-live="polite">
          {monthLabel(month)}
        </strong>
        <button
          type="button"
          className="ratis-calendar-step"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="다음 달"
        >
          <ChevronRight aria-hidden />
        </button>
      </div>

      <div className="ratis-calendar-week" aria-hidden>
        {WEEKDAYS.map((w) => (
          <span key={w} className="ratis-calendar-weekday">
            {w}
          </span>
        ))}
      </div>

      <div className="ratis-calendar-grid" role="grid" aria-label={monthLabel(month)}>
        {monthGrid(month).map(({ date, outside }) => {
          const label = toDateString(date)
          const picked =
            mode === 'single'
              ? pickedAt && isSameDay(date, pickedAt)
              : (startAt && isSameDay(date, startAt)) || (endAt && isSameDay(date, endAt))
          return (
            <button
              key={label}
              type="button"
              role="gridcell"
              className="ratis-calendar-day"
              data-outside={outside || undefined}
              data-today={isSameDay(date, today) || undefined}
              data-picked={picked || undefined}
              data-edge={
                mode === 'range' && startAt && endAt
                  ? isSameDay(date, startAt)
                    ? 'start'
                    : isSameDay(date, endAt)
                      ? 'end'
                      : undefined
                  : undefined
              }
              data-between={inRange(date) || undefined}
              aria-pressed={picked ? true : undefined}
              aria-label={label}
              disabled={outside}
              onClick={() => choose(date)}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
