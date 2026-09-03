import type { ReactNode } from 'react'
import { Button } from '../ui/Button'
import { cx } from './util'
import './SideRow.css'

/**
 * 사이드바 줄 — 글리프 하나와 이름 하나로 서는 조작 (「새 대화」 · 「대화 검색」).
 *
 * ★ 버튼으로 강조하지 않는다. 면도 선도 없는 **평범한 메뉴 줄**이다 — ChatGPT·Claude 도
 *   「새 채팅」을 이렇게 둔다. 강조는 화면당 하나면 되고 그 자리는 대화 화면의 보내기가
 *   이미 쓰고 있다.
 *
 * ★ 맨 `button` 에 CSS 를 직접 쓰지 않는다. 킷 `Button`(variant text)을 쓰고 여기서는
 *   격자·높이·들여쓰기만 얹는다 — 종전에 자체 CSS 로 두었을 때 라운드가 8 이었고
 *   (다른 버튼은 전부 알약) 높이·글자를 직접 박아 컨트롤 사다리를 지나쳤다.
 *
 * ★ **이름을 조각으로 감싼다** (`.ratis-row-label`). 맨 텍스트 노드는 CSS 로 못 잡아
 *   레일로 접힐 때 글자를 걷을 방법이 `font-size: 0` 뿐이었다. 조각이면 다른 글자들과
 *   같이 옅어진다.
 *
 * ★ 레일에서는 이름이 감춰지므로 `aria-label` 로 이름을 따로 준다 (기획 §11).
 *   글자가 보일 때도 같은 이름이라 보조기술이 두 번 읽지 않는다.
 */
export function SideRow({
  icon,
  label,
  className,
  onClick,
  ...rest
}: {
  /** 이름 앞 글리프. 18 짜리를 24 칸 가운데 세운다 */
  icon: ReactNode
  label: string
  className?: string
  onClick?: () => void
} & Pick<
  React.ComponentPropsWithoutRef<'button'>,
  'aria-haspopup' | 'aria-expanded' | 'aria-controls' | 'title'
>) {
  return (
    <Button
      variant="text"
      size="medium"
      className={cx('ratis-row', className)}
      aria-label={label}
      onClick={onClick}
      {...rest}
    >
      {icon}
      <span className="ratis-row-label">{label}</span>
    </Button>
  )
}
