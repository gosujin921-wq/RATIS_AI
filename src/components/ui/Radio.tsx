import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../custom/util'
import type { ChoiceSize } from './Checkbox'
import './Field.css'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  children?: ReactNode
  description?: ReactNode
  size?: ChoiceSize
  wrapClassName?: string
}

/**
 * 라디오 — 갈래 중 하나를 고르는 낱개. 같은 `name` 을 준 것끼리 한 묶음이 된다.
 *
 * 언제 이걸 쓰나: 선택지에 `전체`·`선택 안 함` 처럼 조건을 안 거는 상태가 섞여 있거나,
 * 갈래가 넷 이상일 때. 갈래가 둘·셋이고 서로 대등하면 붙은 세그먼트가 낫다 — 붙어 있는
 * 모양 자체가 하나만 켜진다고 말한다. 값이 열 개를 넘으면 드롭다운으로 접는다.
 *
 * 원과 점은 label 의 가상요소가 그린다 (Checkbox 와 같은 구조).
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ children, description, size = 'medium', wrapClassName, className, id, ...rest }, ref) => {
    const auto = useId()
    const inputId = id ?? auto
    const descId = description ? `${inputId}-desc` : undefined

    return (
      <div className={cx('ratis-choice', 'is-radio', size !== 'medium' && size, wrapClassName)}>
        <input
          ref={ref}
          type="radio"
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
Radio.displayName = 'Radio'
