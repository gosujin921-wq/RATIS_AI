import type { ReactNode } from 'react'
import { cx } from './util'
import { href as withBase } from '../../app/basePath'
import './CellLink.css'

/**
 * 표 안 제목 링크 — 목록형 화면의 표에서 제목 칸을 누를 수 있게 만드는 요소.
 * 표 안에서는 밑줄 없이 본문색으로 두고, 호버·포커스에서만 밑줄을 드러낸다
 * (링크가 줄마다 파랗게 깔리면 표가 시끄러워진다).
 *
 * href 면 링크(a), onClick 이면 버튼(button)으로 그린다 — 상세로 이동하는 목록과
 * 모달을 여는 목록이 같은 룩을 쓰기 때문이다 (공지사항 / 문의하기).
 */
export function CellLink({
  href,
  onClick,
  children,
  className,
}: {
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
}) {
  const cls = cx('klid-cell-link', className)
  if (href) {
    return (
      <a className={cls} href={withBase(href)}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  )
}
