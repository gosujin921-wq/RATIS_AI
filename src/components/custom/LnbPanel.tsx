import { useState } from 'react'
import { PanelLeftClose, PanelLeftOpen, UserRound, type LucideIcon } from 'lucide-react'
import { IconButton } from './IconButton'
import { cx } from './util'
import { href as withBase } from '../../app/basePath'
import './LnbPanel.css'

export interface LnbPanelItem {
  key: string
  label: string
  href: string
  icon?: LucideIcon
  /** 2단 하위 항목. 한 화면 안의 목차를 메뉴로 올릴 때 쓴다 (예: 이용 가이드 카테고리) */
  children?: LnbPanelItem[]
  /** 2단 항목에 순서가 있을 때 앞에 두는 번호. 아이콘 자리를 대신 쓴다 */
  ordinal?: string
}

export interface LnbPanelProps {
  /** 메뉴 카드 상단 소구획 라벨 */
  title: string
  items: LnbPanelItem[]
  currentKey?: string
  /** 사용자 카드. 객체면 사용자, 'guest' 면 게스트 카드, 생략하면 카드를 렌더하지 않는다(관리자 등) */
  user?: { name: string; sub: string } | 'guest'
  /** 접기(폴딩) 토글. 접으면 64px 아이콘 레일 + 호버 툴팁 (기본 true) */
  collapsible?: boolean
  defaultCollapsed?: boolean
  className?: string
}

/**
 * 좌측 LNB 패널 (SHELL-001 lnb region · 240px). 워크스페이스·마이페이지·관리자 공용.
 * 사용자 카드 + 메뉴 카드(제목 라벨·접기 토글·아이콘 메뉴). (기준: /style LNB)
 * sticky 배치·본문 결합은 호출부(레이아웃)가 담당한다.
 */
export function LnbPanel({
  title,
  items,
  currentKey,
  user,
  collapsible = true,
  defaultCollapsed = false,
  className,
}: LnbPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const guest = user === 'guest'

  return (
    <aside className={cx('klid-lnb', className)} data-collapsed={collapsed || undefined}>
      {user && (
        <div className="klid-lnb-user">
          <span className="klid-lnb-avatar" data-guest={guest || undefined} aria-hidden>
            {guest ? <UserRound /> : user.name.charAt(0)}
          </span>
          {!collapsed && (
            <span className="klid-lnb-user-meta" data-guest={guest || undefined}>
              <strong>{guest ? '게스트' : user.name}</strong>
              <small>{guest ? '로그인이 필요합니다' : user.sub}</small>
            </span>
          )}
        </div>
      )}

      <nav className="klid-lnb-menu" aria-label={title}>
        <div className="klid-lnb-head">
          {!collapsed && <span className="klid-lnb-label">{title}</span>}
          {collapsible && (
            <span className="klid-lnb-tt-wrap">
              <IconButton
                size="sm"
                tone="muted"
                aria-label={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
                onClick={() => setCollapsed((v) => !v)}
              >
                {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              </IconButton>
              <span className="klid-lnb-tt">{collapsed ? '메뉴 펼치기' : '메뉴 접기'}</span>
            </span>
          )}
        </div>
        <ul>
          {items.map((item) => {
            const Icon = item.icon
            const active = currentKey === item.key
            // 하위 항목이 현재면 부모는 현재가 아니라 "열린 그룹" 이다 — 배경 없이 글자만 진하게
            const open = item.children?.some((c) => c.key === currentKey)
            return (
              <li key={item.key} className="klid-lnb-item">
                <a
                  href={withBase(item.href)}
                  className="klid-lnb-link"
                  aria-current={active ? 'page' : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  data-open={open || undefined}
                >
                  {Icon && <Icon aria-hidden />}
                  {!collapsed && <span>{item.label}</span>}
                </a>
                {collapsed && <span className="klid-lnb-tt klid-lnb-tt-side">{item.label}</span>}
                {!collapsed && item.children && (
                  <ul className="klid-lnb-sub">
                    {item.children.map((child) => (
                      <li key={child.key} className="klid-lnb-item">
                        <a
                          href={withBase(child.href)}
                          className="klid-lnb-link"
                          aria-current={currentKey === child.key ? 'page' : undefined}
                          data-ordered={child.ordinal ? '' : undefined}
                        >
                          {child.ordinal && (
                            <span className="klid-lnb-ord" aria-hidden>
                              {child.ordinal}
                            </span>
                          )}
                          <span>{child.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
