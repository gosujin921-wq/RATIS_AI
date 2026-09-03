import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../custom/util'
import './ToggleSwitch.css'

export interface ToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> {
  /** 무엇을 켜고 끄는지. 주면 라벨 왼쪽 · 스위치 오른쪽으로 줄이 선다 */
  label?: ReactNode
  /** 라벨 아래 한 줄. 켰을 때 무슨 일이 생기는지 */
  description?: ReactNode
  size?: 'sm' | 'md'
  onChange?: (checked: boolean) => void
  wrapClassName?: string
}

/**
 * 켜고 끄는 스위치 — **누르는 즉시 반영되는** 설정에 쓴다 (목록의 노출 토글, 폼 창의 상단 고정).
 *
 * 체크박스와 무엇이 다른가: 체크박스는 「제출할 때 함께 넘어가는 값」이고 스위치는
 * 「지금 켜지는 상태」다. 그래서 스위치를 놓은 자리에는 저장 버튼이 없거나, 있어도 이
 * 값만은 먼저 반영된다. 폼 안에서 제출을 기다리는 값이면 체크박스를 쓴다.
 *
 * ★ 라벨을 주면 **줄 양끝으로 벌어진다.** 라벨이 스위치에 딱 붙으면 여러 줄이 세로로
 *   쌓였을 때 스위치들이 글자 길이만큼 들쭉날쭉 서서, 무엇이 켜져 있는지 한눈에 훑을 수 없다.
 *   오른쪽 한 줄에 세우면 켜짐·꺼짐이 세로로 정렬된다.
 * ★ 라벨을 안 주면 스위치만 선다 — 표 셀 안이 그 자리다. 그때는 `aria-label` 이 필수다.
 *
 * 색만으로 말하지 않는다 — 켜지면 면이 차는 동시에 손잡이가 오른쪽으로 옮겨 간다.
 */
export const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ label, description, size = 'md', onChange, wrapClassName, className, id, ...rest }, ref) => {
    const auto = useId()
    const inputId = id ?? auto
    const descId = description ? `${inputId}-desc` : undefined

    return (
      <div className={cx('ratis-switch', wrapClassName)} data-size={size} data-standalone={label ? undefined : ''}>
        {label && (
          <label className="ratis-switch-label" htmlFor={inputId}>
            {label}
            {description && (
              <span className="ratis-switch-desc" id={descId}>
                {description}
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={inputId}
          className={cx('ratis-switch-input', className)}
          aria-describedby={descId}
          onChange={(e) => onChange?.(e.currentTarget.checked)}
          {...rest}
        />
        {/* 손잡이가 미끄러지는 홈. 입력 자체는 감추고 이 상자가 모양을 진다 */}
        <span className="ratis-switch-track" aria-hidden />
      </div>
    )
  },
)
ToggleSwitch.displayName = 'ToggleSwitch'
