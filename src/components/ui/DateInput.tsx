import { useEffect, useId, useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { cx } from '../custom/util'
import { Calendar } from './Calendar'
import { caretAfterFormat, formatDateDigits } from './date'
import './Field.css'
import './DateInput.css'

/**
 * 날짜 한 칸 — 직접 칠 수도 있고 달력에서 고를 수도 있다.
 *
 * ★ **둘 다 열어 둔다.** 아는 날짜를 넣을 때는 치는 쪽이 훨씬 빠르고(생일·시행일),
 *   「이번 달 마지막 금요일」처럼 달을 봐야 아는 날은 달력이 빠르다. 한쪽만 두면 다른 쪽
 *   사람이 매번 돌아간다.
 * ★ 치는 동안 **점을 대신 끼워 넣는다.** 형식을 지키라고 안내만 하면 `20260903` 같은
 *   숫자열이 그대로 저장까지 흘러간다. 커서가 튀지 않게 두는 규칙은 date.ts 참조.
 *
 * 값은 밖에서 들 수도(`value` + `onChange`) 안에서 들 수도(`defaultValue`) 있다.
 * 폼 창처럼 제출할 때 한 번에 읽어 가는 자리는 안에서 들면 된다.
 */
export function DateInput({
  label,
  help,
  error,
  value,
  defaultValue = '',
  onChange,
  placeholder = 'YYYY.MM.DD',
  size = 'medium',
  placement = 'down',
  required,
  disabled,
  id,
  className,
  wrapClassName,
  'aria-label': ariaLabel,
}: {
  label?: string
  help?: string
  error?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  size?: 'small' | 'medium'
  /** 달력이 펴지는 쪽. 창 아래쪽에 서는 칸은 `up` */
  placement?: 'down' | 'up'
  required?: boolean
  disabled?: boolean
  id?: string
  className?: string
  wrapClassName?: string
  /** 이름표를 세울 자리가 없는 조건 줄에서 쓴다 */
  'aria-label'?: string
}) {
  const auto = useId()
  const inputId = id ?? auto
  const helpId = help && !error ? `${inputId}-help` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  const [inner, setInner] = useState(defaultValue)
  const current = value ?? inner
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  const apply = (next: string) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }

  /* 바깥을 누르면 닫는다. 초점이 밖으로 나가는 경우(Tab)는 아래 onBlur 가 맡는다 —
     클릭만 보면 키보드로 지나가는 사람에게 달력이 열린 채 남는다 */
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
      className={cx('ratis-field', 'ratis-dateinput', size !== 'medium' && size, Boolean(error) && 'is-invalid', wrapClassName)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false)
      }}
    >
      {label && (
        <label className="ratis-field-label" htmlFor={inputId}>
          {label}
          {required && (
            <span className="ratis-field-required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="ratis-dateinput-box">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          className={cx('ratis-field-input', className)}
          value={current}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId ?? helpId}
          onChange={(e) => {
            const el = e.currentTarget
            const caret = el.selectionStart ?? el.value.length
            const digitsBefore = el.value.slice(0, caret).replace(/\D/g, '').length
            const next = formatDateDigits(el.value)
            apply(next)
            /* 값을 우리가 고쳐 담았으므로 커서도 우리가 되돌려 놓는다. 다시 그린 뒤라야
               자리가 남아 있어 다음 프레임에 놓는다 */
            requestAnimationFrame(() => el.setSelectionRange(
              caretAfterFormat(next, digitsBefore),
              caretAfterFormat(next, digitsBefore),
            ))
          }}
        />
        <button
          type="button"
          className="ratis-dateinput-open"
          disabled={disabled}
          aria-label={`${label ?? ariaLabel ?? '날짜'} 달력 열기`}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <CalendarDays aria-hidden />
        </button>

        {open && (
          <div className="ratis-dateinput-pop" data-placement={placement}>
            <Calendar
              value={current}
              onSelect={(d) => {
                apply(d)
                setOpen(false)
              }}
            />
          </div>
        )}
      </div>

      {error ? (
        <p id={errorId} className="ratis-field-error">
          {error}
        </p>
      ) : (
        help && (
          <p id={helpId} className="ratis-field-help">
            {help}
          </p>
        )
      )}
    </div>
  )
}
