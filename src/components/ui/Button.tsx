import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { cx } from '../custom/util'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'text'
export type ButtonSize = 'small' | 'medium'
export type ButtonTone = 'default' | 'danger'

/**
 * 버튼 — 이 서비스의 버튼은 전부 이 하나로 선다.
 *
 * ★ 모양을 **우리가 낸다.** 종전에는 외부 킷 버튼을 쓰느라 자리마다 특정도를 세 겹으로
 *   올리고 `!important` 로 되받아야 했다 (킷이 `height: auto !important` 를 걸어 둔 탓).
 *   지금은 다른 리듬이 필요한 자리(사이드바 줄)도 그냥 값을 적으면 된다.
 *
 * 모양은 전부 토큰에서 온다 (`ratis-tokens.css`). 캡슐 라운드, 컨트롤 사다리(sm 36 · md 44),
 * 갈래별 색. **lg(52)는 없다** — 화면을 끝내는 제출 버튼이 없는 서비스다.
 *
 * `as="a"` 로 링크로 세울 수 있다. 누르면 이동하는 것은 링크로 두어야 새 탭·주소 복사가
 * 살고 보조기술도 「링크」로 읽는다.
 */
export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'medium',
  tone = 'default',
  className,
  children,
  ...rest
}: {
  as?: T
  variant?: ButtonVariant
  size?: ButtonSize
  /**
   * 위험 톤 — **되돌릴 수 없는 걸음에만** 쓴다 (삭제 · 영구 제거 · 차단).
   * 갈래(채움·선·글자)는 그대로 두고 색만 바꾼다. 빨강이 흔해지면 정작 위험한 자리에서
   * 눈에 걸리지 않는다.
   * ⚠ 그 창의 **안전한 쪽**(취소·머무르기)에는 쓰지 않는다 — 되돌리는 길이 붉으면
   *   무엇이 위험한 걸음인지 뒤바뀐다.
   */
  tone?: ButtonTone
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>) {
  /* ★ 타입만 `button` 으로 못박는다. 런타임은 넘어온 태그를 그대로 쓴다.
     제네릭 태그를 그대로 JSX 에 놓으면 children 이 `never` 로 좁혀져 (TS2745)
     내용을 못 넣는다 — 다형 부품에서 흔한 자리다 */
  const Tag = (as ?? 'button') as 'button'
  return (
    <Tag
      /* 링크로 설 때는 type 을 주지 않는다 — a 태그에 없는 속성이다 */
      {...(Tag === 'button' ? { type: 'button' } : null)}
      className={cx('ratis-btn', className)}
      data-variant={variant}
      data-size={size}
      data-tone={tone === 'default' ? undefined : tone}
      {...rest}
    >
      {children}
    </Tag>
  )
}
