import { useEffect, useRef, useState } from 'react'
import { CalendarDays, X } from 'lucide-react'
import { Calendar } from '../ui/Calendar'
import { caretAfterFormat, formatDateDigits, fromDateString } from '../ui/date'
import { IconButton } from './IconButton'
import { cx } from './util'
import './DateRangeFilter.css'

/** 고른 기간. 안 고른 쪽은 빈 글자열이다 */
export interface DateRange {
  start: string
  end: string
}

const EMPTY: DateRange = { start: '', end: '' }

/**
 * 기간 필터 — 시작일·종료일을 **칩 한 조각**으로 받는다.
 *
 * 입력 두 칸을 조건 줄에 늘어놓는 대신 [달력글리프][기간][×] 를 한 캡슐에 담는다.
 * 조건 줄은 「지금 무엇으로 걸러져 있는가」를 말하는 줄이라, 걸린 기간이 칩 라벨로 그대로
 * 서야 한눈에 읽힌다. 안 고르면 전 기간이다.
 *
 * ★ 칩을 누르면 카드가 열리고 그 안에서 **치는 길과 고르는 길이 함께** 있다. 아는 날짜는
 *   치는 쪽이 빠르고, 달을 봐야 아는 날은 달력이 빠르다 (날짜 한 칸과 같은 문법).
 * ★ **끝을 고르는 순간 닫힌다.** 기간은 두 번 누르면 끝나는 일이라, 다 골랐는데 카드가
 *   남아 있으면 무엇을 더 해야 하는지 찾게 된다. 「확인」 버튼을 따로 두지 않는 까닭이다.
 * ★ **지우는 길을 남긴다.** 한 번 고른 뒤 전 기간으로 되돌릴 수단이 없으면 조건을 풀려고
 *   화면을 새로 고치게 된다.
 */
export function DateRangeFilter({
  label = '조회 기간',
  value,
  defaultValue,
  onChange,
  align = 'start',
  size = 'md',
  className,
}: {
  /** 고르기 전 칩에 뜨는 이름. 보조기술이 읽는 이름의 뿌리이기도 하다 */
  label?: string
  /** 밖에서 들 때 */
  value?: DateRange
  /** 안에서 들 때의 첫 기간 */
  defaultValue?: DateRange
  /** 고른 기간이 바뀔 때. 「지우기」로 비울 때도 빈 값으로 한 번 온다 */
  onChange?: (range: DateRange) => void
  /** 카드가 펴지는 쪽. 줄 오른쪽 끝에 서는 칩은 `end` (왼쪽 맞춤이면 화면 밖으로 나간다) */
  align?: 'start' | 'end'
  /** 칩 키. 조건 줄에서 sm 컨트롤과 나란히 설 때만 낮춘다 */
  size?: 'md' | 'sm'
  className?: string
}) {
  const [inner, setInner] = useState<DateRange>(defaultValue ?? EMPTY)
  const range = value ?? inner
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  const settled = Boolean(range.start && range.end)
  const chipLabel = settled ? `${range.start} - ${range.end}` : label

  const apply = (next: DateRange) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }

  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div
      ref={root}
      className={cx('ratis-date-range', className)}
      data-align={align}
      data-size={size}
      data-set={settled || undefined}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false)
      }}
    >
      <button
        type="button"
        className="ratis-date-range-chip"
        aria-expanded={open}
        aria-label={settled ? `${label} ${chipLabel}` : `${label} 고르기`}
        onClick={() => setOpen((o) => !o)}
      >
        <CalendarDays aria-hidden />
        <span>{chipLabel}</span>
      </button>

      {/* 걸어 둔 기간을 푸는 길. 칩 안이 아니라 옆에 서는 까닭은 칩 전체가 여는 자리라
          그 안에 또 누를 것을 넣으면 두 표적이 겹치기 때문이다 */}
      {settled && (
        <IconButton
          size="sm"
          className="ratis-date-range-clear"
          aria-label={`${label} 지우기`}
          onClick={() => apply(EMPTY)}
        >
          <X aria-hidden />
        </IconButton>
      )}

      {open && (
        <div className="ratis-date-range-pop">
          <div className="ratis-date-range-inputs">
            <RangeInput
              label="시작일"
              value={range.start}
              onValue={(v) => apply({ ...range, start: v })}
            />
            <span className="ratis-date-range-tilde" aria-hidden>
              ~
            </span>
            <RangeInput
              label="종료일"
              value={range.end}
              onValue={(v) => apply({ ...range, end: v })}
            />
          </div>
          <Calendar
            mode="range"
            range={range}
            onSelectRange={(next) => {
              apply(next)
              /* 끝까지 골랐으면 할 일이 끝났다 */
              if (next.start && next.end) setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

/**
 * 카드 안 날짜 한 칸.
 *
 * ★ **다 친 날짜만 밖으로 내보낸다.** 한 글자 칠 때마다 값을 올리면 칩 라벨이
 *   `2026.02.02 - 203` 처럼 덜 친 값으로 서고, 글자가 늘고 줄 때마다 칩 너비가 흔들려
 *   거기 매달린 카드까지 함께 움직인다. 고치는 중인 값은 칸 안에만 두고, 칩에는 다 고른
 *   값만 올린다. 빈 값은 「지웠다」는 뜻이라 그대로 내보낸다.
 */
function RangeInput({
  label,
  value,
  onValue,
}: {
  label: string
  value: string
  onValue: (v: string) => void
}) {
  const [draft, setDraft] = useState(value)
  /* 밖에서 값이 갈리면(달력에서 골랐다) 칸도 따라간다 */
  useEffect(() => setDraft(value), [value])

  return (
    <label className="ratis-date-range-field">
      <span className="visually-hidden">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="YYYY.MM.DD"
        value={draft}
        onChange={(e) => {
          const el = e.currentTarget
          const caret = el.selectionStart ?? el.value.length
          const digitsBefore = el.value.slice(0, caret).replace(/\D/g, '').length
          const next = formatDateDigits(el.value)
          setDraft(next)
          if (next === '' || fromDateString(next)) onValue(next)
          requestAnimationFrame(() => {
            const at = caretAfterFormat(next, digitsBefore)
            el.setSelectionRange(at, at)
          })
        }}
      />
    </label>
  )
}
