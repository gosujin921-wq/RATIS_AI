import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { SkipLink } from '../../components/ui/SkipLink'
import { LnbPanel } from '../../components/custom/LnbPanel'
import { AdminHeader } from '../AdminHeader'
import { ADMIN_PAGE_ACTIONS_ID } from './AdminPageActions'
import './AdminLayout.css'

export interface AdminMenuItem {
  key: string
  label: string
  href: string
  icon?: LucideIcon
}

/**
 * 관리자 콘솔 셸 — 머리 줄 아래 바탕이 깔리고, 그 위에 좌 240 메뉴 카드와 본문이 나란히 뜬다.
 *
 * ★ **본문을 흰 판으로 감싸지 않는다.** 바탕 위에 뜨는 것은 **낱개 카드**다 (KPI · 표 셸 ·
 *   차트 카드). 본문 전체를 판 하나로 감싸면 그 안의 카드들이 흰 면 위의 흰 면이 되어
 *   경계가 사라지고, 제목·조건 줄까지 판 안으로 들어가 화면이 한 덩어리로 굳는다.
 *   제목 · 조건 줄 · 페이저는 바탕에 그대로 선다.
 * ★ 메뉴는 **접히지 않는다** (`collapsible={false}`). 관리 화면은 목록과 표가 폭을 다 쓰는
 *   자리라 접기가 도움이 될 것 같지만, 관리자는 화면 사이를 계속 오가는 사람이라 메뉴가
 *   늘 보이는 편이 낫다. 접었다 폈다 하는 상태가 하나 줄기도 한다.
 * ★ **데스크톱 전용이다.** 표가 열 예닐곱을 지고 있어 좁은 화면에서는 어느 쪽으로 접어도
 *   읽히지 않는다. 억지로 접는 대신 안내만 세운다.
 *
 * ★ **자리와 상태만 진다.** 지금 어느 화면인지(`currentKey`), 제목 줄에 무엇이 서는지
 *   (`actions`)는 부르는 쪽이 정한다 — 이 셸은 라우터를 알지 못한다. 라우터를 붙일 때는
 *   이 셸을 감싸는 쪽에서 주소를 읽어 `currentKey` 를 넘기면 되고, 셸은 그대로 둔다.
 */
export function AdminLayout({
  items,
  currentKey,
  title,
  actions,
  userName,
  onLogout,
  children,
}: {
  items: AdminMenuItem[]
  /** 지금 열린 메뉴. 메뉴 이름이 곧 화면 제목이라 `title` 을 안 주면 여기서 가져온다 */
  currentKey?: string
  /** 제목을 메뉴 이름과 다르게 세워야 할 때만 */
  title?: string
  /** 제목 줄 오른쪽. 화면 안에서 넘기려면 `AdminPageActions` 를 쓴다 */
  actions?: ReactNode
  /** 머리 줄 오른쪽에 서는 이름 */
  userName?: string
  /** 넘기면 머리 줄에 로그아웃이 선다 (AdminHeader 주석의 미정 사항 참조) */
  onLogout?: () => void
  children: ReactNode
}) {
  const current = items.find((i) => i.key === currentKey)

  return (
    <>
      <SkipLink targetId="admin-content">본문 바로가기</SkipLink>
      <div className="ratis-admin">
        <AdminHeader userName={userName} onLogout={onLogout} />

        <main id="admin-content" className="ratis-admin-main" tabIndex={-1}>
          <div className="ratis-admin-layout">
            {/* 메뉴 카드 위에 라벨 줄을 두지 않는다 — 이 메뉴가 화면 전체를 가르는 자리라
                그 위에 또 이름을 얹을 것이 없다 */}
            <LnbPanel
              items={items.map((i) => ({ key: i.key, label: i.label, href: i.href, icon: i.icon }))}
              currentKey={currentKey}
              collapsible={false}
            />
            <div className="ratis-admin-body">
              <div className="ratis-admin-page-head">
                <h1 className="ratis-admin-page-title">{title ?? current?.label}</h1>
                {/* 화면이 제목 줄에 세우는 조작이 들어오는 자리 (AdminPageActions) */}
                <div id={ADMIN_PAGE_ACTIONS_ID} className="ratis-admin-page-actions">
                  {actions}
                </div>
              </div>
              {children}
            </div>
          </div>
        </main>
      </div>
      <p className="ratis-admin-desktop-notice">관리자 콘솔은 데스크톱 환경에서 이용할 수 있어요.</p>
    </>
  )
}
