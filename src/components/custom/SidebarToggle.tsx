import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import './SidebarToggle.css'

/**
 * 사이드바 접기·펼치기 (폴딩).
 *
 * ★ **한 자리가 두 뜻을 진다.** 접기와 펼치기를 각각 두면 접힌 폭에 안 쓰는 단추가 하나
 *   남는다. 모양(패널 왼쪽 닫힘·열림)과 이름이 함께 바뀌고, `aria-expanded` 가 지금
 *   상태를 말한다 — 글리프만 바뀌면 눈으로 보는 사람에게만 상태가 전해진다.
 *
 * ★ `aria-controls` 로 무엇을 접는지 잇는다. 이름이 「사이드바 접기」인데 무엇이 사이드바
 *   인지 보조기술이 알 방법이 그것뿐이다.
 *
 * ★ 넓은 화면 전용이다. 좁은 화면에서는 사이드바가 서랍이라 접을 자리가 없다 (셸이 감춘다).
 */
export function SidebarToggle({
  collapsed,
  onToggle,
  controls,
  className,
}: {
  collapsed: boolean
  onToggle: () => void
  /** 접히는 대상의 id */
  controls: string
  className?: string
}) {
  return (
    <button
      type="button"
      className={className ? `ratis-collapse ${className}` : 'ratis-collapse'}
      aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
      aria-expanded={!collapsed}
      aria-controls={controls}
      onClick={onToggle}
    >
      {collapsed ? <PanelLeftOpen size={18} aria-hidden /> : <PanelLeftClose size={18} aria-hidden />}
    </button>
  )
}
