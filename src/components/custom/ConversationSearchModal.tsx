import { useEffect, useMemo, useRef } from 'react'
import { Modal } from '../ui/Modal'
import { MessageCircle, Pin, Search } from 'lucide-react'
import type { ConversationSummary } from '../../api/types'
import { CONV_GROUP_ORDER, PINNED, conversationBucket } from './ConversationList'
import './ConversationSearchModal.css'

/**
 * 대화 검색 창 (기획 §5.2 후속 「대화 키워드 검색」).
 *
 * ★ **왜 창인가** — 사이드바에 입력칸을 상시로 세우지 않는다 (2026-09-03 개편).
 *   종전에는 「새 대화」 아래에 테두리 있는 흰 입력칸이 늘 서서, 아무것도 찾지 않는
 *   동안에도 목록을 한 칸 밀어내고 사이드바 안에서 혼자 다른 문법(면 + 테두리)을 썼다.
 *   ChatGPT·Gemini 가 모두 **진입점만 줄로 두고 타이핑은 창에서** 받는다
 *   (docs/reference/products/01 — `새 채팅 · 검색(Cmd+K) → Pinned → Recents`).
 *   Gemini 도 검색을 머리 줄 아이콘으로 두고 목록 위에 칸을 세우지 않는다.
 *
 * ★ **머리 줄이 곧 검색칸이다.** 제목 줄을 따로 얹지 않는다 — 창을 연 이유가 검색인데
 *   그 위에 「대화 검색」이라고 한 번 더 적으면 같은 말이 두 줄이 된다. 창의 이름은
 *   보조기술에만 남긴다.
 *
 * ★ 결과는 사이드바와 **같은 묶음 어휘**로 묶는다 (고정됨 · 오늘 · 지난 대화).
 *   묶음 제목은 ConversationList 가 정본이라 거기서 가져온다.
 *
 * ★ 줄에 날짜를 적지 않는다. 사이드바에서 이미 「시각은 줄이 아니라 묶음 제목이 진다」로
 *   정했고 (ConversationList 2026-09-02), 창에서만 달리 적으면 같은 목록이 두 문법이 된다.
 *
 * ★ 여기에 「새 대화」를 두지 않는다. ChatGPT 는 검색 창 첫 줄에 두지만, 이 셸은 같은 자리를
 *   가리키는 입구가 늘어나는 것을 이미 한 번 걷어냈다 (2026-09-01 「대화」 메뉴 제거).
 *   사이드바의 「새 대화」가 바로 위에 서 있다.
 *
 * ★ 줄에 이름 바꾸기·고정·삭제 메뉴를 달지 않는다. 여기는 **찾아서 가는 자리**다.
 *   관리는 사이드바 목록이 진다 — 두 곳에 같은 메뉴를 두면 한쪽만 고쳐질 자리가 하나 는다.
 *
 * 거르는 일은 이 창이 하지 않는다. 제목뿐 아니라 **주고받은 본문까지** 걸어야 하는데
 * 본문은 목록에 없다 — 낱말을 위로 넘기고(`onQueryChange`) 걸러진 목록을 받는다
 * (`results`). 실연동에서는 검색 API 가 그 자리를 진다 (기획 §14 미확정).
 */
export function ConversationSearchModal({
  open,
  onOpenChange,
  query,
  onQueryChange,
  results,
  activeId,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 지금 낱말. 창을 닫아도 셸이 들고 있어 다시 열면 그대로 선다 */
  query: string
  onQueryChange: (next: string) => void
  /** 걸러진 대화. 낱말이 비면 **전부** 온다 — 빈 창을 보여 주지 않고 최근 것부터 세운다 */
  results: ConversationSummary[]
  activeId?: string | null
  onSelect: (id: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  /** 창을 연 자리. 닫을 때 초점을 여기로 돌려준다 */
  const openerRef = useRef<HTMLElement | null>(null)

  /* 열리면 검색칸으로, 닫히면 **연 자리로** 초점을 옮긴다.
     ★ 열 때 — 열고 나서 칸을 한 번 더 누르게 하지 않는다. 킷이 창 안 첫 요소로 초점을
       옮긴 뒤에 잡아야 해서 한 틱 미룬다.
     ★ 닫을 때 — 킷은 초점을 되돌리지 않아 `body` 로 떨어진다 (2026-09-03 실측).
       그러면 Tab 이 지면 맨 처음부터 다시 시작해, 창을 닫은 사람은 방금 있던 자리를
       키보드로 잃는다. 처음 렌더에서는 연 적이 없어 아무 일도 하지 않는다 */
  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement | null
      const id = window.setTimeout(() => inputRef.current?.focus(), 0)
      return () => window.clearTimeout(id)
    }
    const opener = openerRef.current
    openerRef.current = null
    opener?.focus?.()
  }, [open])

  /* 나가는 길 둘 — Esc · 바깥(가림막) 누르기.
     ★ 창 부품이 둘 다 받는다 (Modal.tsx — Esc · 가림막).
       셸의 사용자 메뉴·레일 목록도 같은 이유로 각자 이 listener 를 갖고 있다.
     ★ 삭제 확인 창(공용 Dialog)에는 이걸 달지 않는다. 거기는 되돌릴 수 없는 걸음을 묻는
       자리라 실수로 스치는 클릭에 닫히면 안 되지만, 여기는 **골라서 가는 자리**다 —
       찾다 만 사람을 창 안에 가둘 이유가 없다.
     창이 떠 있는 동안만 단다 — 늘 달아 두면 닫힌 창이 다른 곳의 Esc 를 먹는다 */
  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    const onDown = (e: globalThis.MouseEvent) => {
      /* 가림막 그 자체를 눌렀을 때만. 창 안에서 시작한 드래그가 여기서 끝나도 닫지 않는다 */
      if ((e.target as HTMLElement | null)?.classList?.contains('modal-back')) onOpenChange(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open, onOpenChange])

  /** 사이드바와 같은 순서·같은 이름으로 묶는다 */
  const groups = useMemo(() => {
    const sorted = [...results].sort(
      (a, b) => +new Date(b.lastConversedAt) - +new Date(a.lastConversedAt),
    )
    const map = new Map<string, ConversationSummary[]>()
    for (const c of sorted) {
      const g = conversationBucket(c)
      const list = map.get(g)
      if (list) list.push(c)
      else map.set(g, [c])
    }
    return CONV_GROUP_ORDER.filter((g) => map.has(g)).map((g) => [g, map.get(g)!] as const)
  }, [results])

  return (
    <Modal.Root size="md" open={open} onOpenChange={onOpenChange}>
      {/* 킷은 `aria-labelledby` 를 걸지 않는다 (Dialog.tsx 와 같은 우회) — 창의 이름을 직접 잇는다 */}
      <Modal.Content className="conv-search" aria-labelledby="conv-search-title">
        {/* 화면에는 적지 않는다. 돋보기와 안내 문구가 자리를 말하고, 이름은 보조기술 몫이다 */}
        <h2 id="conv-search-title" className="visually-hidden">
          대화 검색
        </h2>

        {/* 머리 줄 = 검색칸. 킷 헤더의 X 와 같은 줄에 선다 */}
        <div className="conv-search-field">
          <Search size={18} aria-hidden className="conv-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="conv-search-input"
            aria-label="대화 검색어"
            placeholder="대화 검색"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>

        <div className="conv-search-results">
          {groups.length === 0 ? (
            /* 찾다가 빈 것과 아직 대화가 없는 것은 다른 말이다 */
            <p className="conv-search-empty">
              {query.trim() ? '검색 결과가 없습니다.' : '아직 대화가 없습니다.'}
            </p>
          ) : (
            groups.map(([label, items]) => (
              <section key={label} className="conv-search-group">
                {/* 묶음 제목이 곧 목록의 이름 — 보조기술이 「오늘, 목록, 2개 항목」으로 읽는다 */}
                <h3 className="conv-search-group-title" id={`conv-search-${label}`}>
                  {label}
                </h3>
                <ul className="conv-search-items" aria-labelledby={`conv-search-${label}`}>
                  {items.map((c) => (
                    <li key={c.conversationId}>
                      <button
                        type="button"
                        className="conv-search-item"
                        /* 지금 열려 있는 대화는 색만으로 알리지 않는다 */
                        aria-current={c.conversationId === activeId ? 'true' : undefined}
                        onClick={() => {
                          onSelect(c.conversationId)
                          onOpenChange(false)
                        }}
                      >
                        <span className="conv-search-item-icon" aria-hidden>
                          {label === PINNED ? <Pin size={16} /> : <MessageCircle size={16} />}
                        </span>
                        <span className="conv-search-item-title">
                          {c.title || '제목 없는 대화'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </Modal.Content>
    </Modal.Root>
  )
}
