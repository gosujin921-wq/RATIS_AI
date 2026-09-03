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
  /**
   * 메뉴 카드 상단 소구획 라벨. **없어도 된다** — 메뉴가 화면 전체를 가르는 자리(관리자
   * 콘솔)에서는 그 위에 또 이름을 얹을 것이 없다. 라벨도 접기도 없으면 머리 줄 자체가
   * 서지 않는다 (빈 줄만 남고 아래 선이 그어지는 것을 막는다)
   */
  title?: string
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
    <aside className={cx('ratis-lnb', className)} data-collapsed={collapsed || undefined}>
      {user && (
        <div className="ratis-lnb-user">
          <span className="ratis-lnb-avatar" data-guest={guest || undefined} aria-hidden>
            {guest ? <UserRound /> : user.name.charAt(0)}
          </span>
          {!collapsed && (
            <span className="ratis-lnb-user-meta" data-guest={guest || undefined}>
              <strong>{guest ? '게스트' : user.name}</strong>
              <small>{guest ? '로그인이 필요합니다' : user.sub}</small>
            </span>
          )}
        </div>
      )}

      <nav className="ratis-lnb-menu" aria-label={title ?? '메뉴'}>
        {(title || collapsible) && (
        <div className="ratis-lnb-head">
          {!collapsed && title && <span className="ratis-lnb-label">{title}</span>}
          {collapsible && (
            <span className="ratis-lnb-tt-wrap">
              <IconButton
                size="sm"
                tone="muted"
                aria-label={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
                onClick={() => setCollapsed((v) => !v)}
              >
                {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              </IconButton>
              <span className="ratis-lnb-tt">{collapsed ? '메뉴 펼치기' : '메뉴 접기'}</span>
            </span>
          )}
        </div>
        )}
        <ul>
          {items.map((item) => {
            const Icon = item.icon
            const active = currentKey === item.key
            // 하위 항목이 현재면 부모는 현재가 아니라 "열린 그룹" 이다 — 배경 없이 글자만 진하게
            const open = item.children?.some((c) => c.key === currentKey)
            return (
              <li key={item.key} className="ratis-lnb-item">
                <a
                  href={withBase(item.href)}
                  className="ratis-lnb-link"
                  aria-current={active ? 'page' : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  data-open={open || undefined}
                >
                  {Icon && <Icon aria-hidden />}
                  {!collapsed && <span>{item.label}</span>}
                </a>
                {collapsed && <span className="ratis-lnb-tt ratis-lnb-tt-side">{item.label}</span>}
                {!collapsed && item.children && (
                  <ul className="ratis-lnb-sub">
                    {item.children.map((child) => (
                      <li key={child.key} className="ratis-lnb-item">
                        <a
                          href={withBase(child.href)}
                          className="ratis-lnb-link"
                          aria-current={currentKey === child.key ? 'page' : undefined}
                          data-ordered={child.ordinal ? '' : undefined}
                        >
                          {child.ordinal && (
                            <span className="ratis-lnb-ord" aria-hidden>
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
