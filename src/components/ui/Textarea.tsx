import { forwardRef, useId } from 'react'
import type { ReactNode, TextareaHTMLAttributes } from 'react'
import { cx } from '../custom/util'
import './Field.css'
import './Textarea.css'

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'size'> {
  /** 입력칸 이름. 자리표시글이 이름을 대신하지 않는다 — 글자를 넣으면 사라진다 */
  label?: ReactNode
  help?: ReactNode
  error?: ReactNode
  /** 값만 돌려준다 — 쓰는 쪽이 이벤트를 다시 풀 일이 없다 */
  onChange?: (value: string) => void
  /** 글자 수를 세어 보여줄지. 한계는 `maxLength` 가 준다 */
  showCount?: boolean
  wrapClassName?: string
}

/**
 * 여러 줄 입력칸.
 *
 * 이름 · 입력칸 · 도움말(또는 오류)이 세로로 선다. `TextInput` 과 같은 골격·같은 클래스를
 * 쓰므로 폼 안에서 두 칸이 같은 리듬으로 앉는다.
 *
 * ★ **높이를 여기서 늘리지 않는다.** 내용에 따라 자라는 자리(대화 컴포저)는 쓰는 쪽이
 *   줄 수를 재서 넣는다 — 여기서 `field-sizing` 이나 스크립트를 얹으면 그 자리의 규칙
 *   (다섯 줄에서 멈추고 안에서 스크롤)과 두 겹이 된다.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, help, error, onChange, showCount, rows = 3, wrapClassName, className, id, value, maxLength, required, ...rest },
    ref,
  ) => {
    const auto = useId()
    const fieldId = id ?? auto
    const helpId = help && !error ? `${fieldId}-help` : undefined
    const errorId = error ? `${fieldId}-error` : undefined
    const length = typeof value === 'string' ? value.length : 0

    return (
      <div className={cx('ratis-field', Boolean(error) && 'is-invalid', wrapClassName)}>
        {label && (
          <label className="ratis-field-label" htmlFor={fieldId}>
            {label}
            {required && (
              <span className="ratis-field-required" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          className={cx('ratis-field-input', 'ratis-textarea', className)}
          rows={rows}
          value={value}
          maxLength={maxLength}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId ?? helpId}
          onChange={(e) => onChange?.(e.target.value)}
          {...rest}
        />
        {/* 글자 수는 **한계가 있을 때만** 뜻이 있다. 한계가 없으면 세어 봐야 할 이유가 없다 */}
        {showCount && maxLength ? (
          <p className="ratis-textarea-count" aria-live="polite">
            {length.toLocaleString()} / {maxLength.toLocaleString()}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="ratis-field-error">
            {error}
          </p>
        ) : help ? (
          <p id={helpId} className="ratis-field-help">
            {help}
          </p>
        ) : null}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
