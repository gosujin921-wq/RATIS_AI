import { useId, type ReactNode } from 'react'
import { cx } from '../custom/util'
import { Dropdown, type DropdownOption } from './Dropdown'
import './Field.css'

/**
 * 폼 안의 고르는 칸 — 이름표가 위에 서고 그 아래 목록이 붙는다.
 *
 * `Dropdown` 과 무엇이 다른가: Dropdown 은 **목록 위 조건 줄**의 조작이라 이름표를 트리거
 * 안에 넣거나 아예 두지 않는다. 이쪽은 **폼의 한 칸**이라 이름표·필수 표시·도움말·오류가
 * 다른 입력칸과 같은 자리에 같은 모양으로 서야 한다. 창 안에서 입력칸과 나란히 섰을 때
 * 이름표 높이가 어긋나면 두 칸의 밑선이 안 맞는다.
 *
 * 고르는 일 자체는 Dropdown 이 그대로 한다 — 목록·키보드·보조기술 이름은 그쪽 몫이다.
 * 여기서 더하는 것은 폼 칸의 껍데기뿐이다.
 */
export function Select({
  label,
  options,
  value,
  defaultValue,
  onChange,
  hint,
  error,
  required,
  disabled,
  size = 'medium',
  placeholder,
  id,
  className,
}: {
  label?: string
  options: readonly DropdownOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** 고르기 전에 알아야 하는 것. 오류가 뜨면 물러난다 */
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  disabled?: boolean
  size?: 'small' | 'medium'
  placeholder?: string
  id?: string
  className?: string
}) {
  const auto = useId()
  const fieldId = id ?? auto
  const hintId = hint && !error ? `${fieldId}-help` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={cx('ratis-field', size !== 'medium' && size, Boolean(error) && 'is-invalid', className)}>
      {label && (
        /* 트리거는 input 이 아니라 버튼이라 htmlFor 로 못 잡는다 — 이름은 aria-label 로 준다 */
        <span className="ratis-field-label" id={`${fieldId}-label`}>
          {label}
          {required && (
            <span className="ratis-field-required" aria-hidden="true">
              *
            </span>
          )}
        </span>
      )}
      <Dropdown
        options={options}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        size={size}
        disabled={disabled}
        placeholder={placeholder}
        /* 이름표는 span 이라 트리거와 이어지지 않는다 — 보조기술이 읽을 이름은 여기서 준다 */
        aria-label={label ?? placeholder ?? '선택'}
      />
      {error ? (
        <p id={errorId} className="ratis-field-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="ratis-field-help">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
