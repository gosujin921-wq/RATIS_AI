import type { MouseEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Button, SkipLink } from 'krds-react'
import {
  ChevronUp,
  CircleHelp,
  ExternalLink,
  LogOut,
  Menu,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
  Settings,
  User,
  X,
} from 'lucide-react'
import type { ConversationSummary, Me } from '../api/types'
import { ConversationList } from '../components/custom/ConversationList'
import { Dialog } from '../components/custom/Dialog'
import { SettingsDialog } from '../components/custom/SettingsDialog'
import ratisLogo from '../assets/ratis-logo.svg'
import './AppShell.css'

/**
 * SHELL-001 이용자 셸.
 *
 * 좌측 사이드바에 로고 · 새 대화 · **이전 채팅 목록**(API-022) · 회원 정보를 세로로 쌓는다.
 * 메뉴 줄은 두지 않는다 — 이 셸의 화면은 대화 하나뿐이라, 「대화」 항목이 로고·「새 대화」와
 * 같은 자리를 가리키는 세 번째 입구가 됐다 (2026-09-01 제거).
 * 「지난 대화」 별도 화면은 두지 않는다 — 요구사항(§5.2 대화 목록 · §8 대화 이력)이 요구하는
 * 목록·선택·삭제를 아래 「이전 채팅」이 그대로 하고 있어 중복이었다 (2026-09-01 제거).
 * 정부24 AI(사이드바 260px + 본문 800px)와 ChatGPT·Claude 가 모두 이 구성이다
 * (docs/reference/products/01 · 04).
 *
 * ★ 전역 검색창을 두지 않는다 — 이 시스템에서 검색은 대화 화면 자체다.
 * ★ 역할은 「등급」이 아니라 소속 표기까지만 (SHELL-001).
 */

/** RATIS 본체 홈. 챗봇은 그 안의 한 서비스라 돌아갈 자리가 있어야 한다 (기획 §5.1) */
const RATIS_HOME = 'https://www.ratis.or.kr/'

const ROLE_LABEL: Record<Me['role'], string> = {
  GENERAL: '일반회원',
  ASSOC: '협회회원',
  ADMIN: '관리자',
}

/**
 * 홈 링크 클릭 처리 — **라우터 도입 전 임시 조치**.
 *
 * 로고와 「대화」 메뉴는 주소가 있어야 맞으므로 a 태그로 두되(새 탭·주소 복사·스크린리더),
 * 평범한 좌클릭만 가로채 화면을 초기 상태로 되돌린다. 그냥 두면 문서 이동이 일어나
 * 앱이 통째로 다시 뜨고, 데모 초기값(대화가 있는 상태)이 그대로 복원돼
 * 「홈을 눌렀는데 대화 화면이 나오는」 상태가 된다.
 *
 * 실연동에서 라우터가 들어오면 이 함수를 지우고 Link 로 바꾼다.
 */
function homeClick(onHome?: () => void) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    // 새 탭·새 창으로 여는 클릭은 건드리지 않는다
    if (!onHome || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    onHome()
  }
}

export function AppShell({
  me,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onTogglePinConversation,
  onNewConversation,
  onHome,
  onHelp,
  onLogout,
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
  /** 로고·「대화」 메뉴 — 대화 화면의 시작 상태로 되돌린다 (라우터 도입 전 임시) */
  onHome?: () => void
  /** 도움말 (기획 §5.1). 실연동 시 도움말 화면·문서로 보낸다 */
  onHelp?: () => void
  /**
   * 로그아웃 (기획 §5.1).
   * ⚠ **RATIS 본체 SSO 에서도 로그아웃되는지는 미확정이다** (기획 §14 인증 연동).
   *   화면은 걸음만 제공하고 실제 동작은 이 핸들러가 진다.
   */
  onLogout?: () => void
  children: ReactNode
}) {
  /** 삭제 확인 대상. 되돌릴 수 없는 걸음이라 바로 지우지 않는다 (기획 §8.1 삭제 확인) */
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  /** 좁은 화면에서 사이드바를 서랍으로 연다 (기획 §5.2 · §12.1 반응형) */
  const [sideOpen, setSideOpen] = useState(false)
  /** 넓은 화면에서 사이드바를 접었는가. 접으면 본문이 폭을 다 쓴다 */
  const [collapsed, setCollapsed] = useState(false)
  const [settings, setSettings] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  /** 레일에서 연 목록. 접었을 때만 쓴다 — 펼친 사이드바에는 목록이 이미 서 있다 */
  const [railPanel, setRailPanel] = useState<'pinned' | 'recent' | null>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const railPanelRef = useRef<HTMLDivElement>(null)

  /* 바깥 누르기·Esc 로 닫는다 — 열어 두고 다른 곳을 볼 수 있어야 한다 */
  useEffect(() => {
    if (!userMenu) return
    const onDown = (e: globalThis.MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setUserMenu(false)
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenu(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [userMenu])

  /* 레일 목록도 같은 규칙으로 닫는다. 여는 단추와 목록이 서로 다른 자리에 있어
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

  /* 사이드바를 다시 펼치면 레일 목록은 뜻을 잃는다 — 같은 목록이 두 곳에 서면 안 된다 */
  useEffect(() => {
    if (!collapsed) setRailPanel(null)
  }, [collapsed])

  const target = conversations.find((c) => c.conversationId === pendingDelete)

  return (
    <div className="ratis-shell" data-side={collapsed ? 'collapsed' : undefined}>
      <SkipLink targetId="main">본문 바로가기</SkipLink>
      <div className="ratis-body">

      {/* 좁은 화면 전용 머리 줄 — PC 에서는 CSS 로 감춘다.
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
      {sideOpen && (
        <div className="ratis-scrim" aria-hidden onClick={() => setSideOpen(false)} />
      )}

      {/* ── 좌측 사이드바 ─────────────────────────────────────────────── */}
      <div
        className="ratis-side"
        id="ratis-side"
        data-open={sideOpen || undefined}
        data-collapsed={collapsed || undefined}
      >
        {/* 서랍일 때만 보이는 닫기 — PC 에서는 CSS 로 감춘다 */}
        <button
          type="button"
          className="ratis-side-close"
          aria-label="메뉴 닫기"
          onClick={() => setSideOpen(false)}
        >
          <X size={18} aria-hidden />
        </button>
        {/* 로고 영역 — RATIS 공식 CI 워드마크 + 서비스 표기 AI.
            ★ AI 는 워드마크와 **같은 좌표계**(뷰박스 높이 128.75)로 그리고
              베이스라인을 RATIS 레터 밑선(y=106.75)에 맞춘다. 글자로 두면 서체 메트릭에 따라
              밑선이 어긋나므로, 렌더 높이만 같게 두면 저절로 맞는 구조로 만든다.
              fontSize 58 은 원본 레터 캡높이(41.75)에 맞춘 값이다. */}
        <div className="ratis-head">
        <a className="ratis-logo" href="/chat" aria-label="RATIS AI 홈" onClick={homeClick(onHome)}>
          <img className="ratis-logo-mark" src={ratisLogo} alt="RATIS 방사선기술정보시스템" />
          <svg className="ratis-logo-ai" viewBox="0 0 62 128.75" aria-hidden focusable="false">
            <text
              x="0"
              y="106.75"
              textLength="62"
              lengthAdjust="spacingAndGlyphs"
              /* 「AI」는 Roboto 로 쓴다 — 라틴 두 자라 본문 서체와 다른 굵기·폭을 갖는다 */
              fontFamily="Roboto, system-ui, sans-serif"
              fontSize="58"
              fontWeight="800"
              fill="currentColor"
            >
              AI
            </text>
          </svg>
        </a>

        {/* 사이드바 접기·펼치기 — 넓은 화면 전용. 좁은 화면에서는 서랍이라 이 자리가
            필요 없다 (CSS 로 감춘다). 접으면 아이콘 레일로 줄어든다 */}
        <button
          type="button"
          className="ratis-collapse"
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          aria-expanded={!collapsed}
          aria-controls="ratis-side"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <PanelLeftOpen size={18} aria-hidden /> : <PanelLeftClose size={18} aria-hidden />}
        </button>
        </div>

        {/* ★ 디자인시스템 컴포넌트를 쓴다. 맨 button 에 CSS 를 직접 쓰지 않는다 —
            종전에는 자체 CSS 라 라운드가 8px 였고(다른 버튼은 전부 알약), 높이·글자를
            직접 박아 컨트롤 사다리를 지나쳤다. 여기 남은 .ratis-new 는 **배치만** 한다.

            variant 는 text — 면도 선도 없다. ChatGPT·Claude 도 「새 채팅」을 사이드바의
            평범한 메뉴 줄로 두지 버튼으로 강조하지 않는다. 강조는 화면당 하나면 되고
            그 자리는 「질문하기」가 이미 쓰고 있다 (2026-09-01). */}
        <Button
          variant="text"
          size="medium"
          className="ratis-new"
          /* 레일에서는 글자가 감춰지므로 이름을 따로 준다 (기획 §11) */
          aria-label="새 대화"
          onClick={() => {
            onNewConversation?.()
            setSideOpen(false)
          }}
        >
          <Plus size={18} aria-hidden />
          {/* 라벨을 조각으로 감싼다 — 맨 텍스트 노드는 CSS 로 못 잡아 접힐 때
              font-size 로 툭 지울 수밖에 없었다. 이제 다른 글자들과 같이 옅어진다 */}
          <span className="ratis-new-label">새 대화</span>
        </Button>

        {/* ★ 레일 전용 줄 — **접었을 때만** 선다.
            접으면 대화 목록이 통째로 걷히는데, 그러면 레일에 남는 길이 「새 대화」뿐이라
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

        {/* 이전 채팅 — 사이드바에서 바로 고른다. 목록 자체는 컴포넌트가 진다 */}
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={(id) => {
            onSelectConversation?.(id)
            setSideOpen(false)
          }}
          onDelete={onDeleteConversation && ((id) => setPendingDelete(id))}
          onTogglePin={onTogglePinConversation}
        />

        {/* 사이드바 하단 — 회원 표시 + 글자크기 */}
        <div className="ratis-side-foot">
          {/* 사용자 블록 — 누르면 메뉴가 열린다 (기획 §5.1 「RATIS로 돌아가기 또는 로그아웃」·「도움말」).
              ★ 이름이 비어 올 수 있다 (API-031) — 그때는 소속 표기가 이름 자리를 대신한다 */}
          <div className="ratis-user-wrap" ref={userMenuRef}>
            <button
              type="button"
              className="ratis-user"
              aria-haspopup="menu"
              aria-expanded={userMenu}
              onClick={() => setUserMenu(!userMenu)}
            >
              <span className="ratis-avatar" aria-hidden>
                <User size={18} />
              </span>
              <span className="ratis-user-text">
                <span className="ratis-user-name">{me.displayName || ROLE_LABEL[me.role]}</span>
                {me.displayName && <span className="ratis-user-role">{ROLE_LABEL[me.role]}</span>}
              </span>
              <ChevronUp className="ratis-user-caret" size={16} aria-hidden />
            </button>

            {userMenu && (
              /* 사이드바 맨 아래라 **위로** 편다 — 아래로 떨어뜨리면 화면 밖으로 나간다 */
              <div className="ratis-user-menu" role="menu">
                <a
                  className="ratis-user-item"
                  role="menuitem"
                  href={RATIS_HOME}
                  onClick={() => setUserMenu(false)}
                >
                  <ExternalLink size={16} aria-hidden />
                  RATIS 홈으로
                </a>
                <button
                  type="button"
                  className="ratis-user-item"
                  role="menuitem"
                  onClick={() => {
                    setUserMenu(false)
                    onHelp?.()
                  }}
                >
                  <CircleHelp size={16} aria-hidden />
                  도움말
                </button>
                {/* 로그아웃은 되돌릴 수 없는 걸음이라 구분선 아래로 뗀다 */}
                <button
                  type="button"
                  className="ratis-user-item"
                  role="menuitem"
                  data-tone="danger"
                  onClick={() => {
                    setUserMenu(false)
                    onLogout?.()
                  }}
                >
                  <LogOut size={16} aria-hidden />
                  로그아웃
                </button>
              </div>
            )}
          </div>
          {/* 설정 — 자주 여는 자리가 아니라 아이콘 한 줄로 접고, 열면 창에서 넓게 편다.
              종전에는 화면크기 컨트롤이 사이드바에 직접 서 있어, 매 화면에 자리를 차지하면서
              정작 누르는 일은 드물었다. 화면크기는 이 창의 첫 줄로 들어갔다 */}
          <button type="button" className="ratis-settings" onClick={() => setSettings(true)}>
            <Settings size={18} aria-hidden />
            <span className="ratis-settings-label">설정</span>
          </button>
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
            emptyText={
              railPanel === 'pinned' ? '고정한 대화가 없습니다.' : '아직 대화가 없습니다.'
            }
            onSelect={(id) => {
              onSelectConversation?.(id)
              setRailPanel(null)
            }}
            onDelete={
              onDeleteConversation &&
              ((id) => {
                setRailPanel(null)
                setPendingDelete(id)
              })
            }
            onTogglePin={onTogglePinConversation}
          />
        </div>
      )}

      {/* ── 본문 ───────────────────────────────────────────────────────── */}
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

      <SettingsDialog open={settings} onOpenChange={setSettings} />

      {/* 삭제 확인 — 공용 Dialog. 제목이 「무슨 일이 일어나는가」를 말한다 */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="이 대화를 삭제할까요?"
        desc={
          <>
            <strong>{target?.title ?? '제목 없는 대화'}</strong> 의 질문과 답변이 모두 지워집니다.
            되돌릴 수 없습니다.
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
    </div>
  )
}
