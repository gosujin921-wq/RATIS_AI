import type { ReactNode } from 'react'
import { useId } from 'react'
import { cx } from './util'
import './ChipGroup.css'

export interface ChipOption<T extends string> {
  value: T
  label: string
  /** 라벨 앞 아이콘 */
  icon?: ReactNode
  /**
   * 못 고르는 낱개. **지우는 대신 잠그는 자리**다 — 목록에서 빼면 앞으로 생길 갈래가
   * 있다는 사실까지 사라진다. 잠근 낱개에는 왜 못 고르는지를 라벨에 함께 적는다
   * (회색으로만 두면 고장으로 읽힌다).
   */
  disabled?: boolean
}

/**
 * 칩 묶음 — 조건을 고르는 캡슐 줄.
 *
 * **모양이 곧 뜻이다** (design.md §4).
 *   multi   낱개로 흩어진 칩 — 여러 개 켤 수 있다
 *   single  붙인 세그먼트 한 덩어리 — 하나만 켜진다
 * 미선택 상태에서도 몇 개를 고를 수 있는지 모양으로 알 수 있어야 한다.
 *
 * ★ 진짜 `input`(checkbox·radio)을 자리에 두고 눈에서만 감춘다. 버튼에 `aria-pressed` 를
 *   얹으면 보조기술이 낱개마다 켜짐·꺼짐이 따로 있는 것으로 읽어, 「목록 중 하나」라는
 *   사실이 사라진다. 키보드 이동(화살표)도 브라우저가 공짜로 준다.
 * ★ 묶음 이름은 화면에 적지 않는다 — 칩 줄이 서면 「고르는 자리」라는 게 모양으로 읽힌다.
 *   보조기술에는 `role="group"`·`radiogroup` 의 이름으로 남긴다.
 */
export function ChipGroup<T extends string>({
  label,
  name,
  options,
  size = 'medium',
  className,
  ...rest
}: {
  label: string
  /** 라디오 묶음 이름. single 일 때만 쓰인다 */
  name?: string
  options: readonly ChipOption<T>[]
  size?: 'small' | 'medium'
  className?: string
} & (
  | { single: true; value: T; onChange: (next: T) => void }
  | { single?: false; value: readonly T[]; onChange: (next: T[]) => void }
)) {
  const auto = useId()
  const group = name ?? auto

  if (rest.single) {
    const { value, onChange } = rest
    return (
      <div
        className={cx('ratis-chips', 'is-single', className)}
        data-size={size}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((o) => (
          <label key={o.value} className="ratis-chip" data-on={o.value === value || undefined}>
            <input
              type="radio"
              name={group}
              value={o.value}
              checked={o.value === value}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
            />
            {o.icon}
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    )
  }

  const { value, onChange } = rest
  const toggle = (v: T) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])

  return (
    <div className={cx('ratis-chips', className)} data-size={size} role="group" aria-label={label}>
      {options.map((o) => (
        <label key={o.value} className="ratis-chip" data-on={value.includes(o.value) || undefined}>
          <input
            type="checkbox"
            value={o.value}
            checked={value.includes(o.value)}
            disabled={o.disabled}
            onChange={() => toggle(o.value)}
          />
          {o.icon}
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  )
}
