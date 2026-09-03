import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { SkipLink } from '../components/ui/SkipLink'
import { Menu } from 'lucide-react'
import type { ConversationSummary, Me } from '../api/types'
import { ConversationSearchModal } from '../components/custom/ConversationSearchModal'
import { Dialog } from '../components/custom/Dialog'
import { Sidebar } from '../components/custom/Sidebar'
import ratisLogo from '../assets/ratis-logo.svg'
import './AppShell.css'

/**
 * SHELL-001 이용자 셸 — **자리와 상태만** 진다.
 *
 * 왼쪽 사이드바(Sidebar)와 본문(children)을 나란히 세우고, 좁은 화면에서는 사이드바를
 * 서랍으로 돌린다. 사이드바 안에 무엇이 어떤 모양으로 서는지는 그쪽이 안다 —
 * 여기서 아는 것은 「열렸는가 · 접혔는가」와 화면 전체에 걸리는 창 둘뿐이다.
 *
 * 이 셸이 직접 갖는 것
 *   · 좁은 화면 머리 줄과 가림막 — 사이드바를 서랍으로 여닫는 자리
 *   · 삭제 확인 창 — 되돌릴 수 없는 걸음이라 목록이 아니라 화면 전체가 묻는다.
 *     사이드바 목록에서 눌러도 레일 목록에서 눌러도 같은 창이 떠야 한다
 *   · 대화 검색 창과 Cmd+K
 *   · 전역 고지 한 줄 — 서비스 전체에 걸리는 말이라 대화 화면이 아니라 셸의 몫이다
 */
export function AppShell({
  me,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onTogglePinConversation,
  onNewConversation,
  onHome,
  onSearch,
  searchResults,
  children,
}: {
  /** API-031 응답. displayName 은 비어 올 수 있다 */
  me: Me
  /** API-022 응답 — 이전 채팅 목록 */
  conversations: ConversationSummary[]
  activeConversationId?: string | null
  onSelectConversation?: (id: string) => void
  /** 대화 삭제 (기획 §5.2 · §8.1). 확인 창은 이 셸이 띄운다 */
  onDeleteConversation?: (id: string) => void
  /** 대화 고정·해제 (기획 §5.2 후속 「대화 즐겨찾기」) */
  onTogglePinConversation?: (id: string) => void
  onNewConversation?: () => void
  /** 로고 — 대화 화면의 시작 상태로 되돌린다 (라우터 도입 전 임시) */
  onHome?: () => void
  /**
   * 대화 검색 (기획 §5.2 후속 「대화 키워드 검색」).
   * 낱말을 넘기면 받는 쪽이 걸러 `searchResults` 로 돌려준다 — 제목뿐 아니라 주고받은
   * 본문까지 거는 일은 목록만 가진 이 셸이 할 수 없다.
   * ⚠ 실연동에서는 검색 API 가 이 자리를 진다 (기획 §14 미확정).
   */
  onSearch?: (query: string) => void
  /**
   * 걸러진 대화 — **검색 창에만** 선다. 사이드바 목록은 `conversations` 그대로다.
   * 종전에는 `conversations` 자체가 걸러져 와서 검색 중에는 사이드바가 함께 줄었는데,
   * 창이 목록을 덮고 있는 동안 뒤에서 사이드바가 바뀌어 봐야 볼 수도 없고,
   * 창을 닫으면 목록이 걸러진 채 남아 「대화가 사라진」 것처럼 보였다.
   * 넘기지 않으면 창은 `conversations` 를 그대로 쓴다.
   */
  searchResults?: ConversationSummary[]
  children: ReactNode
}) {
  /** 삭제 확인 대상. 되돌릴 수 없는 걸음이라 바로 지우지 않는다 (기획 §8.1 삭제 확인) */
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  /** 좁은 화면에서 사이드바를 서랍으로 연다 (기획 §5.2 · §12.1 반응형) */
  const [sideOpen, setSideOpen] = useState(false)
  /** 넓은 화면에서 사이드바를 접었는가. 접으면 본문이 폭을 다 쓴다 */
  const [collapsed, setCollapsed] = useState(false)
  /** 대화 검색어. 거르는 일은 받는 쪽(onSearch)이 하고 이 셸은 낱말만 들고 있는다 */
  const [search, setSearch] = useState('')
  /** 대화 검색 창이 떠 있는가 */
  const [searchOpen, setSearchOpen] = useState(false)

  /* Cmd/Ctrl+K 로 검색 창을 연다 — ChatGPT 와 같은 자리의 같은 손버릇이다.
     ★ 글을 치고 있는 중에는 가로채지 않는다. 질문 입력칸에서 Cmd+K 를 누르는 일은 없지만,
       브라우저·보조기술이 입력 문맥에서 이 조합을 쓰는 경우가 있어 칸 안에서는 비켜 준다.
       창 자체의 검색칸은 예외다 — 거기서 다시 누르면 닫힌다 */
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'k' || !(e.metaKey || e.ctrlKey)) return
      const el = document.activeElement
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      if (typing && !el.closest('.conv-search')) return
      e.preventDefault()
      setSearchOpen((v) => !v)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const target = conversations.find((c) => c.conversationId === pendingDelete)

  const changeSearch = (next: string) => {
    setSearch(next)
    onSearch?.(next)
  }

  return (
    <div className="ratis-shell" data-side={collapsed ? 'collapsed' : undefined}>
      <SkipLink targetId="main">본문 바로가기</SkipLink>
      <div className="ratis-body">
        {/* 좁은 화면 전용 머리 줄 — 넓은 화면에서는 CSS 로 감춘다.
            사이드바가 서랍으로 들어가면 대화 목록·새 대화로 가는 길이 사라지므로 여기서 연다 */}
        <div className="ratis-topbar">
          <button
            type="button"
            className="ratis-topbar-menu"
            aria-label="메뉴 열기"
            aria-expanded={sideOpen}
            aria-controls="ratis-side"
            onClick={() => setSideOpen(true)}
          >
            <Menu size={20} aria-hidden />
          </button>
          <img className="ratis-topbar-logo" src={ratisLogo} alt="RATIS 방사선기술정보시스템" />
        </div>

        {/* 서랍이 열려 있을 때만 서는 가림막. 눌러서 닫는다.
            ★ 보조기술에는 숨긴다 — 닫는 조작은 서랍 안 X 하나로 족한데, 가림막까지 버튼으로
              내놓으면 「메뉴 닫기」가 두 개로 읽히고 탭 순서에 빈 칸이 하나 늘어난다.
              마우스로 바깥을 누르는 길은 그대로 산다 */}
        {sideOpen && <div className="ratis-scrim" aria-hidden onClick={() => setSideOpen(false)} />}

        <Sidebar
          me={me}
          conversations={conversations}
          activeConversationId={activeConversationId}
          open={sideOpen}
          collapsed={collapsed}
          searchOpen={searchOpen}
          onClose={() => setSideOpen(false)}
          onToggleCollapsed={() => setCollapsed(!collapsed)}
          onNewConversation={onNewConversation}
          onOpenSearch={() => setSearchOpen(true)}
          onSelectConversation={onSelectConversation}
          onRequestDelete={onDeleteConversation && ((id) => setPendingDelete(id))}
          onTogglePinConversation={onTogglePinConversation}
          onHome={onHome}
        />

        {/* ── 본문 ─────────────────────────────────────────────────────── */}
        <main id="main" className="ratis-main">
          {children}
          {/* 전역 고지 — 대화 카드 **안쪽 맨 아래**에 붙는 한 줄. 흰 면 위에 올라탄다.
              스크롤·대화 상태와 무관하게 늘 같은 자리다.
              서비스 전체에 걸리는 말이라 대화 화면이 아니라 셸이 갖는다 (기획 §7) */}
          <p className="ratis-notice">
            참고용 서비스이며 한국방사선진흥협회의 공식 견해가 아닙니다. 중요한 내용은 근거 원문을 확인하세요.
            개인정보는 입력하지 마세요.
          </p>
        </main>
      </div>

      {/* 삭제 확인 — 공용 Dialog. 제목이 「무슨 일이 일어나는가」를 말한다 */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="이 대화를 삭제할까요?"
        tone="danger"
        desc={
          <>
            {/* 지워지는 대상은 **제 줄에 세운다.** 문장 안에 섞으면 어디까지가 대화 이름이고
                어디부터가 설명인지 눈으로 갈리지 않는다.
                조사(의)는 앞말에 붙인다 — 사이를 띄우면 「대화 의」로 읽힌다 */}
            <span className="ratis-dialog-subject">
              <strong>{target?.title ?? '제목 없는 대화'}</strong>의
            </span>
            {/* 한 문장에 사실 하나 — 무엇이 지워지는가 / 되돌릴 수 있는가 */}
            <span className="ratis-dialog-line">질문과 답변이 모두 지워집니다.</span>
            <span className="ratis-dialog-line">되돌릴 수 없습니다.</span>
          </>
        }
        main={{
          label: '삭제',
          onClick: () => {
            if (pendingDelete) onDeleteConversation?.(pendingDelete)
            setPendingDelete(null)
          },
        }}
        sub={{ label: '취소', onClick: () => setPendingDelete(null) }}
      />

      {/* 대화 검색 창 — 사이드바의 「대화 검색」 줄과 Cmd+K 가 함께 연다.
          거르는 일은 위(onSearch)가 하고, 걸러진 목록이 searchResults 로 돌아온다 */}
      <ConversationSearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        query={search}
        onQueryChange={changeSearch}
        results={searchResults ?? conversations}
        activeId={activeConversationId}
        onSelect={(id) => {
          onSelectConversation?.(id)
          setSideOpen(false)
        }}
      />
    </div>
  )
}
