import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** 관리자 셸이 제목 줄에 비워 두는 자리 (AdminLayout) */
export const ADMIN_PAGE_ACTIONS_ID = 'ratis-admin-page-actions'

/**
 * 화면이 **제목 줄에 세우는 조작** — 「새 공지 작성」·「목록 내려받기」처럼 그 화면 전체를
 * 상대하는 버튼이다.
 *
 * 제목은 셸이 그리므로(AdminLayout) 화면이 그 줄에 무엇을 얹으려면 자리를 건네받아야 한다.
 * 셸이 비워 둔 자리로 옮겨 심는다. 화면 쪽 코드에서는 버튼이 화면 안에 있고, 그려지기는
 * 제목 옆에 그려진다.
 *
 * 목록 하나를 상대하는 조작(거르기·검색)은 여기가 아니라 목록 위 조건 줄에 둔다.
 */
export function AdminPageActions({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  // 셸이 먼저 그려져 있어야 자리를 찾는다 — 첫 그림 뒤에 한 번 찾고 그대로 쓴다
  useEffect(() => setSlot(document.getElementById(ADMIN_PAGE_ACTIONS_ID)), [])
  return slot ? createPortal(children, slot) : null
}
