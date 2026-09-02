import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cx } from './util'
import './IconButton.css'

type Size = 'sm' | 'md' | 'lg'
type Tone = 'default' | 'primary' | 'muted' | 'danger' | 'favorite'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** sm=28 패널 토글 / md=32 카드·모달 액션 / lg=36 툴바·페이저 (아이콘은 박스의 약 절반) */
  size?: Size
  /** primary=코발트 아이콘 (표 안 다운로드처럼 그 줄의 주요 동작) / danger=삭제류 */
  tone?: Tone
  /** 도구 선택처럼 눌린 상태를 유지하는 토글일 때. 코발트 채움 + aria-pressed
   *  (tone="favorite" 은 표면을 안 칠하고 별만 금색으로 채운다) */
  selected?: boolean
  /**
   * 모서리. 기본은 정사각(라운드 8).
   * `circle` 은 **보내기·확인처럼 그 자리에서 끝나는 한 동작**에 쓴다 — 원은 목록에 섞이지
   * 않고 홀로 서는 모양이라, 도구 줄에 여럿 늘어서는 자리에는 쓰지 않는다.
   */
  shape?: 'square' | 'circle'
  /**
   * 면을 채운다. 화면에서 **가장 높은 급의 실행** 자리 전용 (컴포저 보내기 등).
   * 면·글자색은 primary 버튼과 같은 토큰을 쓴다 — 같은 급이 화면마다 다른 색이면
   * 무엇이 주 동작인지 매번 다시 읽어야 한다.
   */
  filled?: boolean
  /** 아이콘만 있으므로 필수 */
  'aria-label': string
}

/**
 * 아이콘 전용 정사각 버튼. 삭제류는 tone="danger".
 *
 * ★ 잠글 때 `disabled` 와 `aria-disabled` 가 갈린다 — `disabled` 는 pointer-events 를 끊어
 *   **hover·focus 가 아예 오지 않는다.** 왜 못 누르는지를 마우스를 올려 알려 주려면
 *   `aria-disabled` 를 쓰고 onClick 을 걸지 않는다 (모양은 둘이 같다).
 * KRDS Button 의 icon variant 는 버튼 높이 스케일(36/44/52)을 공유해
 * 이 별도 스케일(28/32/36)과 어긋나므로 custom 으로 둔다. (기준: design.md §3)
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      size = 'md',
      tone = 'default',
      shape = 'square',
      filled,
      selected,
      type = 'button',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={selected}
      className={cx('klid-icon-btn', className)}
      data-size={size}
      data-tone={tone}
      data-shape={shape}
      data-filled={filled || undefined}
      {...props}
    />
  ),
)
IconButton.displayName = 'IconButton'
