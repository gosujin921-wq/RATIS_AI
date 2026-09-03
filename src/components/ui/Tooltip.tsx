import { useId, type ReactNode } from 'react'
import { cx } from '../custom/util'
import './Tooltip.css'

/**
 * 이름표 — 아이콘만 서 있는 조작에 그 이름을 붙인다.
 *
 * 표의 행 조작(수정·삭제)이나 편집기 도구 줄처럼 **글자를 세울 자리가 없는 곳**에서만 쓴다.
 * 자리가 있는데 툴팁으로 미루면, 마우스가 없는 사람에게는 그 이름이 늘 없는 것과 같다.
 * 그래서 이름은 툴팁이 갖지 않는다 — 아이콘 버튼의 `aria-label` 이 정본이고 툴팁은 **눈으로
 * 보는 사람에게 같은 말을 한 번 더** 한다. 두 곳에 같은 글자를 적는 까닭이다.
 *
 * ★ 감싼 상자에 건다. 안의 버튼에 직접 걸면 `aria-describedby` 가 버튼의 이름과 겹쳐
 *   보조기술이 같은 말을 두 번 읽는다.
 * ★ 뜨고 지는 것은 CSS 가 한다 (`:hover` · `:focus-within`). 상태를 리액트로 들면
 *   표 안 수십 줄이 저마다 상태를 갖게 되고, 마우스가 줄을 훑을 때마다 그만큼 다시 그린다.
 *
 * 키보드로 온 사람에게도 뜬다 — 초점이 안으로 들어오면 같이 선다.
 */
export function Tooltip({
  text,
  placement = 'top',
  children,
  className,
}: {
  /** 아이콘이 못 하는 말. 짧은 이름 한 마디로 적는다 */
  text: string
  /** 표 아래쪽 줄처럼 위가 막힌 자리는 `bottom` */
  placement?: 'top' | 'bottom'
  children: ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <span className={cx('ratis-tooltip', className)} data-placement={placement}>
      <span className="ratis-tooltip-anchor" aria-describedby={id}>
        {children}
      </span>
      {/* 늘 문서에 있고 보이기만 감춘다 — 뜰 때 새로 만들면 보조기술이 읽을 것이 없다 */}
      <span className="ratis-tooltip-bubble" id={id} role="tooltip">
        {text}
      </span>
    </span>
  )
}
