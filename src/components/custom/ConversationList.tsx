import { useEffect, useMemo, useRef, useState } from 'react'
import { MoreHorizontal, Pin, PinOff, Trash2 } from 'lucide-react'
import type { ConversationSummary } from '../../api/types'
import './ConversationList.css'

/**
 * 이전 대화 목록 — 사이드바에서 지난 대화를 골라 여는 줄 묶음 (API-022).
 *
 * ★ KRDS `SideNavigation` 을 쓰지 않는 이유
 *   그쪽은 `role="menubar"` · `role="menuitem"` 으로 그려진다. 메뉴바는 화살표로 옮겨 다니는
 *   **응용프로그램 메뉴** 위젯을 뜻하는 역할인데, 이 목록은 문서 안의 평범한 목록이고
 *   킷도 그 위젯에 필요한 초점 관리를 갖고 있지 않다. 역할만 얹으면 보조기술에는
 *   메뉴라고 알리면서 메뉴처럼 움직이지는 않는 물건이 된다.
 *
 * ★ 시각을 **줄마다 적지 않고 묶음 제목으로 올린다** (2026-09-02 개편).
 *   종전에는 제목 아래에 「오늘」·「8월 14일」을 달아 한 줄이 두 줄을 먹었다. 목록이
 *   열 개만 넘어도 사이드바가 날짜로 가득 차는데, 정작 고를 때 보는 것은 제목이다.
 *   ChatGPT·Claude·Gemini 가 모두 같은 이유로 묶음 제목 방식을 쓴다.
 *
 * 지금 열린 대화는 `aria-current="true"` 로 알린다 — 색만으로 구분하지 않는다.
 */

const DAY = 24 * 60 * 60 * 1000

/** 오늘 자정 기준으로 며칠 전인지 (시각이 아니라 **날짜** 차이로 센다) */
function daysAgo(iso: string) {
  const d = new Date(iso)
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const now = new Date()
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((b - a) / DAY)
}

function groupOf(iso: string) {
  const n = daysAgo(iso)
  if (n <= 0) return '오늘'
  if (n === 1) return '어제'
  if (n <= 7) return '지난 7일'
  if (n <= 30) return '지난 30일'
  return '이전'
}

const PINNED = '고정됨'
const ORDER = [PINNED, '오늘', '어제', '지난 7일', '지난 30일', '이전']

export function ConversationList({
  conversations,
  activeId,
  emptyText = '아직 대화가 없습니다.',
  onSelect,
  onDelete,
  onTogglePin,
}: {
  conversations: ConversationSummary[]
  activeId?: string | null
  emptyText?: string
  onSelect?: (id: string) => void
  /** 대화 삭제 (기획 §5.2 · §8.1 필수). 확인 창은 셸이 띄운다 */
  onDelete?: (id: string) => void
  /** 대화 고정·해제 (기획 §5.2 후속 「대화 즐겨찾기」) */
  onTogglePin?: (id: string) => void
}) {
  /* 최근 것이 위로. 같은 묶음 안에서도 최근 순이다 */
  const groups = useMemo(() => {
    const sorted = [...conversations].sort(
      (a, b) => +new Date(b.lastConversedAt) - +new Date(a.lastConversedAt),
    )
    const map = new Map<string, ConversationSummary[]>()
    for (const c of sorted) {
      /* 고정한 것은 시각과 무관하게 맨 위 묶음으로 간다 */
      const g = c.pinned ? PINNED : groupOf(c.lastConversedAt)
      const list = map.get(g)
      if (list) list.push(c)
      else map.set(g, [c])
    }
    return ORDER.filter((g) => map.has(g)).map((g) => [g, map.get(g)!] as const)
  }, [conversations])

  if (conversations.length === 0) {
    return (
      <div className="conv-list">
        <p className="conv-list-empty">{emptyText}</p>
      </div>
    )
  }

  return (
    <nav className="conv-list" aria-label="이전 대화">
      {groups.map(([label, items]) => (
        <section key={label} className="conv-group">
          {/* 묶음 제목이 곧 목록의 이름이 된다 — 보조기술이 「오늘, 목록, 2개 항목」으로 읽는다 */}
          <h2 className="conv-group-title" id={`conv-group-${label}`}>
            {label}
          </h2>
          <ul className="conv-items" aria-labelledby={`conv-group-${label}`}>
            {items.map((c) => (
              <li key={c.conversationId} className="conv-row">
                <button
                  type="button"
                  className="conv-item"
                  aria-current={c.conversationId === activeId ? 'true' : undefined}
                  onClick={() => onSelect?.(c.conversationId)}
                >
                  {/* title 이 비면 폴백 표기 — 목록이 깨지면 안 된다 (AC-042) */}
                  {c.title ?? '제목 없는 대화'}
                </button>
                {(onDelete || onTogglePin) && (
                  <RowMenu
                    title={c.title ?? '제목 없는 대화'}
                    pinned={c.pinned}
                    onTogglePin={onTogglePin && (() => onTogglePin(c.conversationId))}
                    onDelete={onDelete && (() => onDelete(c.conversationId))}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  )
}


/**
 * 줄 하나에 붙는 팝오버 메뉴 — 고정·삭제.
 *
 * 버튼 둘을 줄에 늘어놓지 않는다. 대화가 스무 줄이면 아이콘이 마흔 개가 되고, 제목을
 * 읽으러 온 목록이 조작으로 뒤덮인다. 「⋯」 하나만 두고 그 안에서 고른다.
 *
 * 바깥 누르기·Esc 로 닫는다 — 열어 두고 다른 곳을 볼 수 있어야 한다.
 */
function RowMenu({
  title,
  pinned,
  onTogglePin,
  onDelete,
}: {
  title: string
  pinned?: boolean
  onTogglePin?: () => void
  onDelete?: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="conv-menu" ref={ref}>
      {/* 아이콘만 있는 버튼이라 이름에 대화 제목까지 넣는다 — 어느 줄의 메뉴인지 읽힌다 */}
      <button
        type="button"
        className="conv-menu-trigger"
        aria-label={`${title} 메뉴`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <MoreHorizontal size={16} aria-hidden />
      </button>

      {open && (
        <div className="conv-menu-pop" role="menu">
          {onTogglePin && (
            <button
              type="button"
              className="conv-menu-item"
              role="menuitem"
              onClick={() => {
                onTogglePin()
                setOpen(false)
              }}
            >
              {pinned ? <PinOff size={16} aria-hidden /> : <Pin size={16} aria-hidden />}
              {pinned ? '고정 해제' : '대화 고정'}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="conv-menu-item"
              role="menuitem"
              data-tone="danger"
              onClick={() => {
                onDelete()
                setOpen(false)
              }}
            >
              <Trash2 size={16} aria-hidden />
              대화 삭제
            </button>
          )}
        </div>
      )}
    </div>
  )
}
