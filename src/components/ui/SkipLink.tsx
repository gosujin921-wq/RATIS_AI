import type { ReactNode } from 'react'
import './SkipLink.css'

/**
 * 본문 바로가기 — 키보드로 들어온 사람이 사이드바 스무 줄을 지나치지 않게 첫 초점에서
 * 본문으로 건너뛰는 길.
 *
 * ★ **평소에는 안 보이고 초점이 닿을 때만 선다.** `display: none` 으로 감추면 초점 자체가
 *   가지 않아 있으나 마나가 된다 — 화면 밖으로 밀어 두었다가 초점에서 끌어온다.
 */
export function SkipLink({ targetId, children }: { targetId: string; children: ReactNode }) {
  return (
    <a className="ratis-skip" href={`#${targetId}`}>
      {children}
    </a>
  )
}
