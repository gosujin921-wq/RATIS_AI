import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { cx } from './util'
import '../ui/Field.css'
import './SearchField.css'

/**
 * 검색창 — 입력칸 왼쪽에 돋보기를 세운다.
 *
 * 목록 위 조건 줄에 서는 자리라 **이름표가 없다.** 줄 높이를 키우지 않으려는 것이고,
 * 대신 돋보기가 「검색」임을 글자 없이 말한다. 보조기술이 읽을 이름은 `aria-label` 이
 * 갖는다 — 「검색」 하나로는 무엇을 뒤지는 창인지 알 수 없으므로 대상을 함께 적는다
 * (「회원 검색」).
 *
 * 치수는 design.md §3 검색창 규칙 그대로다 — 아이콘(18)을 왼쪽 16 에 두고 글자는 아이콘
 * 뒤 10 에서 시작한다(합계 44).
 *
 * ★ **모양은 줄이 정한다** (design.md §3). 조건 줄에 알약 캡슐(드롭다운 capsule · 기간 칩)이
 *   서 있으면 그 줄의 검색창도 `capsule` 이다 — 한 줄에 각진 것과 알약이 섞이면 같은 일을
 *   하는 조작이 두 갈래로 읽힌다. 각진 폼 컨트롤이 서는 줄에서는 기본형을 쓴다.
 *   **모서리만 바뀐다** — 높이·글자·보더·포커스는 컨트롤 사다리 그대로다.
 */
export function SearchField({
  size = 'medium',
  variant = 'default',
  className,
  wrapClassName,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> & {
  size?: 'small' | 'medium'
  variant?: 'default' | 'capsule'
  wrapClassName?: string
}) {
  return (
    <span
      className={cx('ratis-search-field', 'ratis-field', size !== 'medium' && size, wrapClassName)}
      data-variant={variant}
    >
      <Search aria-hidden />
      <input type="search" className={cx('ratis-field-input', className)} {...rest} />
    </span>
  )
}
