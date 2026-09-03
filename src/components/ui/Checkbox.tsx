import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../custom/util'
import './Field.css'

export type ChoiceSize = 'small' | 'medium'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 낱개 이름. 보조기술이 읽는 이름이기도 하다 */
  children?: ReactNode
  /** 이름 아래 한 줄 부연. 이름에 넣으면 이름이 길어지는 말을 여기로 뺀다 */
  description?: ReactNode
  size?: ChoiceSize
  /** 바깥 상자에 붙일 클래스. className 은 input 이 가져간다 */
  wrapClassName?: string
}

/**
 * 체크박스 — 켜고 끄는 낱개. 여럿을 함께 고르는 자리에 쓴다.
 *
 * 진짜 `<input type="checkbox">` 를 자리에 두고 눈에서만 감춘다. 네모와 갈매기는 label 의
 * 가상요소가 그린다. input 을 지우면 키보드 포커스와 보조기술이 읽는 상태가 함께 사라진다.
 *
 * 하나를 켜고 끄는 스위치가 필요한 자리에는 쓰지 않는다 — 체크박스는 "고른 것들" 중
 * 하나라는 뜻이라, 켬·끔이 즉시 반영되는 설정에는 다른 모양이 맞다.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ children, description, size = 'medium', wrapClassName, className, id, ...rest }, ref) => {
    const auto = useId()
    const inputId = id ?? auto
    const descId = description ? `${inputId}-desc` : undefined

    return (
      <div className={cx('ratis-choice', size !== 'medium' && size, wrapClassName)}>
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={className}
          aria-describedby={descId}
          {...rest}
        />
        <label htmlFor={inputId}>{children}</label>
        {description && (
          <p id={descId} className="ratis-choice-description">
            {description}
          </p>
        )}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export interface ChoiceGroupProps {
  /** 묶음 이름. 소제목을 따로 달지 않는 자리에서 낱개들을 무엇에 대한 답인지로 묶는다 */
  legend?: ReactNode
  /** 세로로 쌓는다. 선택지가 넷을 넘거나 이름이 길면 세로가 읽기 쉽다 */
  column?: boolean
  children?: ReactNode
  className?: string
}

/**
 * 낱개 묶음 — 체크박스·라디오를 함께 세운다.
 *
 * `fieldset`·`legend` 로 묶는다. 폼 라벨(span)은 낱개들과 이어지지 않아서, 보조기술이
 * "무엇을 고르는 중인지"를 못 읽는다.
 */
export function ChoiceGroup({ legend, column, children, className }: ChoiceGroupProps) {
  const items = <div className={cx('ratis-choice-group', column && 'is-column')}>{children}</div>
  if (!legend) return <div className={className}>{items}</div>
  return (
    <fieldset className={className} style={{ border: 0, padding: 0, margin: 0, minInlineSize: 0 }}>
      <legend className="ratis-choice-group-legend">{legend}</legend>
      {items}
    </fieldset>
  )
}
