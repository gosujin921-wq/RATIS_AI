import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../custom/util'
import './Field.css'

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 입력칸 이름. 자리표시글(placeholder)이 이름을 대신하지 않는다 — 글자를 넣으면 사라진다 */
  label?: ReactNode
  /** 무엇을 어떻게 넣는지에 대한 안내. 오류가 뜨면 물러난다 */
  help?: ReactNode
  /** 오류 사유. 무엇이 잘못됐는지와 어떻게 고치는지를 함께 적는다 */
  error?: ReactNode
  size?: 'small' | 'medium'
  wrapClassName?: string
}

/**
 * 한 줄 입력칸.
 *
 * 이름 · 입력칸 · 도움말(또는 오류)이 세로로 선다. 도움말과 오류는 같은 자리를 쓰고
 * 오류가 뜨면 도움말이 물러난다 — 둘이 함께 서면 어느 쪽을 따라야 하는지가 흐려진다.
 *
 * 접근성 — 이름은 `label` 이 `htmlFor` 로 잡고, 도움말·오류는 `aria-describedby` 로 이어
 * 붙인다. 오류일 때는 `aria-invalid` 를 함께 준다. 색만으로 오류를 말하지 않는다.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    { label, help, error, size = 'medium', wrapClassName, className, id, required, ...rest },
    ref,
  ) => {
    const auto = useId()
    const inputId = id ?? auto
    const helpId = help && !error ? `${inputId}-help` : undefined
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className={cx('ratis-field', size !== 'medium' && size, Boolean(error) && 'is-invalid', wrapClassName)}>
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
        <input
          ref={ref}
          type="text"
          id={inputId}
          className={cx('ratis-field-input', className)}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId ?? helpId}
          {...rest}
        />
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
  },
)
TextInput.displayName = 'TextInput'
