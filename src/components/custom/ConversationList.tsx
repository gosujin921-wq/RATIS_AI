import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, MoreHorizontal, Pin, PinOff, Trash2 } from 'lucide-react'
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
 *
 * ★ 묶음은 **「오늘」과 「지난 대화」 둘뿐이다** (2026-09-03).
 *   종전에는 어제·지난 7일·지난 30일·이전까지 다섯 묶음이라, 열두 건짜리 목록에
 *   묶음 제목이 여섯 줄 섞여 제목보다 이름표가 더 눈에 띄었다. 지난 대화를 고를 때
 *   필요한 구분은 「방금 하던 것인가, 지나간 것인가」 하나다.
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

/* ★ 묶음 이름과 순서는 **여기가 정본이다.** 대화 검색 창(ConversationSearchModal)이
   같은 어휘로 결과를 묶으므로 내보낸다 — 한쪽에서만 「지난 대화」를 고치면 사이드바와
   검색 결과가 서로 다른 이름으로 같은 것을 부르게 된다 */
export const PINNED = '고정됨'
export const TODAY = '오늘'
export const PAST = '지난 대화'
export const CONV_GROUP_ORDER = [PINNED, TODAY, PAST]
const ORDER = CONV_GROUP_ORDER

/** 대화 하나가 어느 묶음에 드는가. 고정이 시각을 이긴다 */
export function conversationBucket(c: ConversationSummary) {
  if (c.pinned) return PINNED
  return daysAgo(c.lastConversedAt) <= 0 ? TODAY : PAST
}

/**
 * 한 번에 보여 주는 대화 수. 여기까지만 세우고 나머지는 「더 보기」 뒤에 둔다 —
 * 사이드바는 대화를 훑는 자리가 아니라 최근 것으로 돌아가는 자리라, 스무 줄이
 * 늘어서면 정작 위쪽 새 대화가 밀린다.
 *
 * 고정과 나머지는 **상한도 「더 보기」도 따로 센다.** 둘을 한 상한으로 묶으면 고정을
 * 여섯 개 해 둔 사람에게는 최근 대화가 한 줄도 안 남는다.
 */
const PINNED_LIMIT = 5
const VISIBLE_LIMIT = 8

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
  /** 상한을 풀었는가. 목록이 바뀌어도(검색·삭제) 편 상태는 그대로 둔다 */
  const [expanded, setExpanded] = useState(false)
  const [pinnedExpanded, setPinnedExpanded] = useState(false)

  /* 최근 것이 위로. 같은 묶음 안에서도 최근 순이다 */
  const { groups, hidden, pinnedHidden } = useMemo(() => {
    const sorted = [...conversations].sort(
      (a, b) => +new Date(b.lastConversedAt) - +new Date(a.lastConversedAt),
    )
    /* 고정한 것은 시각과 무관하게 맨 위 묶음이고, 제 상한을 따로 갖는다 */
    const pinned = sorted.filter((c) => c.pinned)
    const rest = sorted.filter((c) => !c.pinned)
    const shownPinned = pinnedExpanded ? pinned : pinned.slice(0, PINNED_LIMIT)
    const shown = expanded ? rest : rest.slice(0, VISIBLE_LIMIT)

    const map = new Map<string, ConversationSummary[]>()
    const put = (g: string, c: ConversationSummary) => {
      const list = map.get(g)
      if (list) list.push(c)
      else map.set(g, [c])
    }
    for (const c of shownPinned) put(PINNED, c)
    for (const c of shown) put(daysAgo(c.lastConversedAt) <= 0 ? TODAY : PAST, c)

    return {
      groups: ORDER.filter((g) => map.has(g)).map((g) => [g, map.get(g)!] as const),
      hidden: rest.length - shown.length,
      pinnedHidden: pinned.length - shownPinned.length,
    }
  }, [conversations, expanded, pinnedExpanded])

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
                  {/* 고정한 줄에는 핀을 세운다. 묶음 제목이 안 보이는 자리(검색 결과·좁은
                      화면에서 스크롤해 내려온 줄)에서도 고정한 것임이 읽힌다.
                      뜻은 아래 감춘 글자가 지고 글리프는 표식만 진다 */}
                  {c.pinned && (
                    <>
                      <Pin size={13} aria-hidden className="conv-item-pin" />
                      <span className="visually-hidden">고정됨:</span>
                    </>
                  )}
                  {/* title 이 비면 폴백 표기 — 목록이 깨지면 안 된다 (AC-042) */}
                  <span className="conv-item-title">{c.title ?? '제목 없는 대화'}</span>
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
          {/* 고정 묶음의 「더 보기」는 **묶음 안**에 둔다. 목록 맨 아래에 두면 무엇을
              더 보는 단추인지 알 수 없다 — 사이에 오늘·지난 대화가 끼어 있다 */}
          {label === PINNED && (pinnedHidden > 0 || pinnedExpanded) && (
            <button
              type="button"
              className="conv-more"
              aria-expanded={pinnedExpanded}
              onClick={() => setPinnedExpanded(!pinnedExpanded)}
            >
              <ChevronDown size={14} aria-hidden className="conv-more-caret" />
              {pinnedExpanded ? '접기' : `고정한 대화 ${pinnedHidden}건 더 보기`}
            </button>
          )}
        </section>
      ))}

      {/* 상한에 걸린 나머지 — 몇 건이 더 있는지 숫자로 말한다. 「더 보기」만 있으면
          한 건이 더 있는지 스무 건이 더 있는지 눌러 봐야 안다.
          ★ 「지난 대화」로 못박지 않는다. 상한은 오늘과 지난 대화를 함께 세므로,
            오늘 아홉 번 물은 날에는 가려지는 것이 오늘 대화다 */}
      {(hidden > 0 || expanded) && (
        <button
          type="button"
          className="conv-more"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronDown size={14} aria-hidden className="conv-more-caret" />
          {expanded ? '접기' : `대화 ${hidden}건 더 보기`}
        </button>
      )}
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
