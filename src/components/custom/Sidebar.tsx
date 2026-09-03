import type { MouseEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Pin, Plus, Search, X } from 'lucide-react'
import type { ConversationSummary, Me } from '../../api/types'
import { BrandLogo } from './BrandLogo'
import { ConversationList } from './ConversationList'
import { SideRow } from './SideRow'
import { SidebarToggle } from './SidebarToggle'
import { UserMenu } from './UserMenu'
import './Sidebar.css'

/**
 * 사이드바 — 로고 · 조작 줄 · 대화 목록 · 회원 블록을 세로로 쌓는 판.
 *
 * 부품(BrandLogo · SidebarToggle · SideRow · ConversationList · UserMenu)을 **모아 세우는
 * 자리**다. 부품은 제 모양만 알고, 어디에 서는지와 접히면 어떻게 되는지는 이 판이 안다.
 *
 * 메뉴 줄은 두지 않는다 — 이 셸의 화면은 대화 하나뿐이라 「대화」 항목이 로고·「새 대화」와
 * 같은 자리를 가리키는 세 번째 입구가 됐다 (2026-09-01 제거).
 * 정부24 AI(사이드바 260px + 본문 800px)와 ChatGPT·Claude 가 모두 이 구성이다.
 *
 * 폭에 따라 서는 방식이 셋이다.
 *   넓은 화면   제자리에 선다. 접으면 **아이콘 레일**(7.2rem)로 줄어든다
 *   좁은 화면   서랍으로 들어간다. 머리 줄의 메뉴 단추가 연다 (가림막·닫기는 셸이 진다)
 *
 * ★ 접힘은 **통째로 숨기는 것이 아니다.** 숨기면 새 대화로 가는 길까지 사라져 매번
 *   펼쳤다 접어야 한다. 레일에는 조작 줄 둘과 고정·최근 목록을 여는 단추가 남는다.
 */

/**
 * 홈 링크 클릭 처리 — **라우터 도입 전 임시 조치**.
 *
 * 로고는 주소가 있어야 맞으므로 a 태그로 두되(새 탭·주소 복사·스크린리더), 평범한
 * 좌클릭만 가로채 화면을 초기 상태로 되돌린다. 그냥 두면 문서 이동이 일어나 앱이 통째로
 * 다시 뜨고, 데모 초기값(대화가 있는 상태)이 그대로 복원돼 「홈을 눌렀는데 대화 화면이
 * 나오는」 상태가 된다. 라우터가 들어오면 이 함수를 지우고 Link 로 바꾼다.
 */
function homeClick(onHome?: () => void) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    // 새 탭·새 창으로 여는 클릭은 건드리지 않는다
    if (!onHome || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    onHome()
  }
}

export function Sidebar({
  me,
  conversations,
  activeConversationId,
  open,
  collapsed,
  searchOpen,
  onClose,
  onToggleCollapsed,
  onNewConversation,
  onOpenSearch,
  onSelectConversation,
  onRequestDelete,
  onTogglePinConversation,
  onHome,
}: {
  me: Me
  /** API-022 응답 — 이전 채팅 목록 */
  conversations: ConversationSummary[]
  activeConversationId?: string | null
  /** 좁은 화면에서 서랍이 열려 있는가 */
  open?: boolean
  /** 넓은 화면에서 레일로 접혀 있는가 */
  collapsed?: boolean
  /** 검색 창이 떠 있는가 — 검색 줄의 `aria-expanded` 가 읽는다 */
  searchOpen?: boolean
  /** 서랍을 닫는다. 무엇을 고르든 좁은 화면에서는 닫고 본문으로 간다 */
  onClose?: () => void
  onToggleCollapsed?: () => void
  onNewConversation?: () => void
  onOpenSearch?: () => void
  onSelectConversation?: (id: string) => void
  /**
   * 삭제를 **요청**한다. 확인 창은 셸이 띄운다 — 되돌릴 수 없는 걸음이라 판이 아니라
   * 화면 전체가 물어야 하고, 레일 목록에서 눌렀을 때도 같은 창이 떠야 한다
   */
  onRequestDelete?: (id: string) => void
  onTogglePinConversation?: (id: string) => void
  onHome?: () => void
}) {
  /** 레일에서 연 목록. 접었을 때만 쓴다 — 펼친 사이드바에는 목록이 이미 서 있다 */
  const [railPanel, setRailPanel] = useState<'pinned' | 'recent' | null>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const railPanelRef = useRef<HTMLDivElement>(null)

  /* 레일 목록은 바깥 누르기·Esc 로 닫는다. 여는 단추와 목록이 서로 다른 자리에 있어
     (단추는 사이드바 안, 목록은 그 옆) 두 곳을 다 확인해야 한다 */
  useEffect(() => {
    if (!railPanel) return
    const onDown = (e: globalThis.MouseEvent) => {
      const t = e.target as Node
      if (railRef.current?.contains(t) || railPanelRef.current?.contains(t)) return
      setRailPanel(null)
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setRailPanel(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [railPanel])

  /* 다시 펼치면 레일 목록은 뜻을 잃는다 — 같은 목록이 두 곳에 서면 안 된다 */
  useEffect(() => {
    if (!collapsed) setRailPanel(null)
  }, [collapsed])

  return (
    <>
      <div
        className="ratis-side"
        id="ratis-side"
        data-open={open || undefined}
        data-collapsed={collapsed || undefined}
      >
        {/* 서랍일 때만 보이는 닫기 — 넓은 화면에서는 CSS 로 감춘다 */}
        <button type="button" className="ratis-side-close" aria-label="메뉴 닫기" onClick={onClose}>
          <X size={18} aria-hidden />
        </button>

        {/* 머리 줄 — 브랜드 락업과 폴딩 토글. 락업의 기하와 토글의 모양은 각 부품이 진다 */}
        <div className="ratis-head">
          <BrandLogo onClick={homeClick(onHome)} />
          {/* 접기·펼치기는 넓은 화면 전용이다. 좁은 화면에서는 서랍이라 이 자리가
              필요 없어 CSS 로 감춘다 */}
          <SidebarToggle
            collapsed={Boolean(collapsed)}
            onToggle={() => onToggleCollapsed?.()}
            controls="ratis-side"
          />
        </div>

        {/* 조작 줄 둘 — 모양·이름·접힘 규칙은 SideRow 가 진다. 여기서는 무엇을 하는지만 준다 */}
        <SideRow
          icon={<Plus size={18} aria-hidden />}
          label="새 대화"
          onClick={() => {
            onNewConversation?.()
            onClose?.()
          }}
        />

        {/* 대화 검색 — 「새 대화」 바로 아래 **같은 문법의 줄**이다 (2026-09-03 개편).
            입력칸을 여기에 세우지 않는다: 아무것도 찾지 않는 동안에도 목록을 한 칸 밀어내고,
            면 + 테두리를 가진 그 칸만 사이드바에서 혼자 다른 문법을 썼다.
            타이핑은 창이 받는다 (ConversationSearchModal · Cmd+K).
            ★ 접었을 때도 선다 — 글리프 칸이 「새 대화」와 같은 자리라 레일에서 아이콘만
              남으면 그대로 돋보기 한 줄이 된다. 레일에서 지난 대화로 가는 길이 하나 는다 */}
        <SideRow
          className="ratis-search-btn"
          icon={<Search size={18} aria-hidden />}
          label="대화 검색"
          aria-haspopup="dialog"
          aria-expanded={searchOpen}
          onClick={() => {
            onOpenSearch?.()
            onClose?.()
          }}
        />

        {/* ★ 레일 전용 줄 — **접었을 때만** 선다.
            접으면 대화 목록이 통째로 걷히는데, 그러면 레일에 남는 길이 조작 줄 둘뿐이라
            지난 대화로 돌아갈 방법이 사라진다. 사이드바를 도로 펼치는 것 말고는 길이
            없으면 접는 기능 자체가 반쪽이 된다.
            고정과 최근을 나눈 이유: 고정은 「내가 표시해 둔 것」이라 목록이 짧고 늘 같은
            자리에 있다. 최근에 섞어 두면 스무 줄을 훑어야 찾는다 */}
        {collapsed && (
          <div className="ratis-rail" ref={railRef}>
            <button
              type="button"
              className="ratis-rail-btn"
              aria-label="고정한 대화"
              aria-haspopup="dialog"
              aria-expanded={railPanel === 'pinned'}
              data-on={railPanel === 'pinned' || undefined}
              onClick={() => setRailPanel(railPanel === 'pinned' ? null : 'pinned')}
            >
              <Pin size={18} aria-hidden />
            </button>
            <button
              type="button"
              className="ratis-rail-btn"
              aria-label="최근 채팅"
              aria-haspopup="dialog"
              aria-expanded={railPanel === 'recent'}
              data-on={railPanel === 'recent' || undefined}
              onClick={() => setRailPanel(railPanel === 'recent' ? null : 'recent')}
            >
              <MessageCircle size={18} aria-hidden />
            </button>
          </div>
        )}

        {/* 이전 채팅 — 사이드바에서 바로 고른다. 목록 자체는 부품이 진다 */}
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={(id) => {
            onSelectConversation?.(id)
            onClose?.()
          }}
          onDelete={onRequestDelete}
          onTogglePin={onTogglePinConversation}
        />

        {/* 사이드바 하단 — 회원 표시.
            ★ 「설정」을 두지 않는다 (2026-09-03). 안에 든 것이 화면 크기 하나였는데 그 줄을
              걷으면서 빈 창만 남았다. 개인화 설정(기획 §12.2)이 확정되면 그때 자리를 만든다 */}
        <div className="ratis-side-foot">
          <UserMenu me={me} />
        </div>
      </div>

      {/* ★ 레일 목록 — 사이드바 **바깥**에 둔다. 사이드바는 접힘 폭을 흘리느라
          overflow: hidden 이라, 안에 두면 옆으로 나온 목록이 7.2rem 에서 잘린다.
          닫는 규칙(바깥 누르기·Esc)은 위 useEffect 가 두 자리를 함께 본다 */}
      {collapsed && railPanel && (
        <div
          className="ratis-rail-panel"
          ref={railPanelRef}
          role="dialog"
          aria-label={railPanel === 'pinned' ? '고정한 대화' : '최근 채팅'}
        >
          <ConversationList
            conversations={
              railPanel === 'pinned' ? conversations.filter((c) => c.pinned) : conversations
            }
            activeId={activeConversationId}
            emptyText={railPanel === 'pinned' ? '고정한 대화가 없습니다.' : '아직 대화가 없습니다.'}
            onSelect={(id) => {
              onSelectConversation?.(id)
              setRailPanel(null)
            }}
            onDelete={
              onRequestDelete &&
              ((id) => {
                setRailPanel(null)
                onRequestDelete(id)
              })
            }
            onTogglePin={onTogglePinConversation}
          />
        </div>
      )}
    </>
  )
}
