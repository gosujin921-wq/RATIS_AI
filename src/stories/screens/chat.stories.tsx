import { useEffect, useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'
import type { Category, ChatMessage, ChatProblem, ConversationSummary, Me } from '../../api/types'
import { AppShell } from '../../app/AppShell'
import { ChatPage } from '../../pages/chat/ChatPage'
import { MSG_EXTERNAL, MSG_INTERNAL, MSG_NARROWED, MSG_REPORT } from '../chat-mocks'

/**
 * SCREEN-001 대화 — 화면이 가질 수 있는 **상태**를 늘어놓는 케이스보드.
 *
 * 셸(AppShell)에 대화 화면(ChatPage)을 태워 실제 폭에서 본다. 여기서 보는 것은
 * 「이 상태일 때 화면이 무엇을 말하는가」다 — 폭·간격·스크롤 주인 같은 **레이아웃 규칙**은
 * 컴포넌트 스토리북(5601)의 「AI chat/전체 레이아웃」 골격 판이 진다.
 *
 * ★ **여기서 답변을 만들지 않는다.** 질문을 보내면 대기 상태까지만 간다 — 응답 흐름
 *   (스트리밍 · 오류 뒷문)은 데모 앱(5600)이 진다. 목업 답변을 아무 질문에나 붙이면
 *   실제 보고서의 수치가 엉뚱한 질문의 답으로 읽힌다.
 */

const ME: Me = { displayName: '김방사', role: 'ASSOC' }

/** API-017 — 협회가 실제로 보유한 자료 묶음 (docs/file_sample 실측) */
const CATEGORIES: Category[] = [
  { categoryId: 'survey', categoryName: '이용실태조사 보고서' },
  { categoryId: 'issue', categoryName: '이슈페이퍼' },
  { categoryId: 'market', categoryName: '시장분석보고서' },
  { categoryId: 'review', categoryName: '학회리뷰보고서' },
  { categoryId: 'law', categoryName: '법령분석보고서' },
  { categoryId: 'biz', categoryName: '기술사업화 자료' },
]

const DAY = 24 * 60 * 60 * 1000
const ago = (days: number, h = 14, m = 0) => {
  const d = new Date(Date.now() - days * DAY)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

const CONVERSATIONS: ConversationSummary[] = [
  { conversationId: 'p1', title: '방사선산업 실태조사 총괄 요약', lastConversedAt: ago(0, 11, 20), pinned: true },
  { conversationId: 'p2', title: '종사자 수 5년 추이', lastConversedAt: ago(41, 15, 5), pinned: true },
  { conversationId: 'c1', title: '2024년 이용기관 수 변화', lastConversedAt: ago(0, 17, 20) },
  { conversationId: 'c2', title: '방사성의약품 신약 개발 동향', lastConversedAt: ago(0, 10, 5) },
  { conversationId: 'c3', title: '방사선 분야 종사자 평균 연봉', lastConversedAt: ago(1, 16, 40) },
  { conversationId: 'c4', title: null, lastConversedAt: ago(1, 9, 15) },
  { conversationId: 'c5', title: '학회리뷰보고서 이용기관 수', lastConversedAt: ago(3, 14, 30) },
  { conversationId: 'c6', title: '의료기관 방사선 장비 보유 추이', lastConversedAt: ago(5, 11, 48) },
  { conversationId: 'c7', title: '산업체 안전관리자 배치 기준', lastConversedAt: ago(12, 13, 2) },
]

/** 목록에서 고른 대화에 실리는 턴들. 없는 대화를 고르면 빈 스트림이다 */
const THREADS: Record<string, ChatMessage[]> = {
  p1: [MSG_INTERNAL, MSG_REPORT],
  c1: [MSG_INTERNAL],
  c2: [MSG_REPORT],
  c3: [MSG_EXTERNAL],
  c5: [MSG_NARROWED],
}

interface LayoutArgs {
  me: Me
  conversations: ConversationSummary[]
  activeConversationId: string | null
  /** 스트림에 실린 턴들 */
  messages: ChatMessage[]
  /** 답변을 기다리는 질문. 있으면 스트림 끝에 「답변 생성 중」 턴이 선다 */
  pendingQuestion: string | null
  /** 오류·제한 띠 (기획 §10.3). 대화를 갈아 끼우지 않고 입력창 위에 얹힌다 */
  problem: ChatProblem | null
  categories: Category[]
}

/**
 * 셸 + 대화 화면을 한 판에 세우고, 화면을 오가는 상태만 여기서 든다.
 * 실연동에서는 이 자리를 API 클라이언트와 라우터가 대신한다 (src/demo/DemoApp.tsx 참고).
 */
function ChatLayout({
  me,
  conversations,
  activeConversationId,
  messages,
  pendingQuestion,
  problem,
  categories,
}: LayoutArgs) {
  const [convs, setConvs] = useState(conversations)
  const [active, setActive] = useState(activeConversationId)
  const [thread, setThread] = useState(messages)
  const [asking, setAsking] = useState(pendingQuestion)
  const [search, setSearch] = useState('')

  /* 컨트롤을 바꾸면 그 값으로 돌아온다 — 스토리북은 다시 마운트하지 않고 args 만 갈아 끼운다 */
  useEffect(() => setConvs(conversations), [conversations])
  useEffect(() => setActive(activeConversationId), [activeConversationId])
  useEffect(() => setThread(messages), [messages])
  useEffect(() => setAsking(pendingQuestion), [pendingQuestion])

  /* 대화 검색 창에만 서는 목록. 제목만 걸어도 이 자리에서는 충분하다 —
     본문까지 거는 일은 실연동에서 검색 API 가 진다 (기획 §14 미확정) */
  const results = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (q.length === 0) return convs
    return convs.filter((c) => (c.title ?? '').toLowerCase().includes(q))
  }, [convs, search])

  const openConversation = (id: string) => {
    setActive(id)
    setThread(THREADS[id] ?? [])
    setAsking(null)
  }

  const startNew = () => {
    setActive(null)
    setThread([])
    setAsking(null)
  }

  return (
    <AppShell
      me={me}
      conversations={convs}
      activeConversationId={active}
      searchResults={results}
      onSearch={setSearch}
      onSelectConversation={openConversation}
      onNewConversation={startNew}
      onHome={startNew}
      onDeleteConversation={(id) => {
        setConvs((prev) => prev.filter((c) => c.conversationId !== id))
        if (id === active) startNew()
      }}
      onTogglePinConversation={(id) =>
        setConvs((prev) =>
          prev.map((c) => (c.conversationId === id ? { ...c, pinned: !c.pinned } : c)),
        )
      }
    >
      <ChatPage
        messages={thread}
        categories={categories}
        pendingQuestion={asking}
        problem={problem}
        /* 대기 상태까지만 간다 (위 주석 참고). 멈추기를 누르면 그 턴이 걷힌다 */
        onAsk={setAsking}
        onStop={() => setAsking(null)}
        onFeedback={(f) => console.info('[스토리] 피드백', f)}
        onDownloadSource={(e) => console.info('[스토리] 원문 다운로드', e.fileName)}
      />
    </AppShell>
  )
}

const meta = {
  title: '이용자/대화',
  component: ChatLayout,
  parameters: {
    layout: 'fullscreen',
    /* 바탕은 앱 자신의 그러데이션(index.css 의 body)이다. 배경 도구가 흰 면을 덮으면
       사이드바가 앉는 면이 사라져 셸의 비례를 볼 수 없다 */
    backgrounds: { disable: true },
    viewport: {
      options: {
        /* design.md §9 — 767 이하 모바일 / 768~1023 태블릿 / 1024 이상 데스크톱.
           1280 은 원문 패널이 분할 뷰로 서는 지점이다 (SourcePanel.css) */
        desktop1440: { name: '데스크톱 1440', type: 'desktop', styles: { width: '1440px', height: '900px' } },
        desktop1280: { name: '데스크톱 1280', type: 'desktop', styles: { width: '1280px', height: '800px' } },
        tablet768: { name: '태블릿 768', type: 'tablet', styles: { width: '768px', height: '1024px' } },
        mobile390: { name: '모바일 390', type: 'mobile', styles: { width: '390px', height: '844px' } },
      },
    },
  },
  args: {
    me: ME,
    conversations: CONVERSATIONS,
    activeConversationId: null,
    messages: [],
    pendingQuestion: null,
    problem: null,
    categories: CATEGORIES,
  },
} satisfies Meta<typeof ChatLayout>

export default meta
type Story = StoryObj<typeof meta>

/** 들어오면 만나는 화면 — 오브와 문구, 그리고 입력창 하나. 사이드바에 지난 대화가 남아 있다 */
export const Default: Story = { name: '기본 (새 대화)' }

/** 턴이 쌓인 상태. 스트림과 입력창이 같은 폭을 쓰는지 여기서 본다 */
export const Conversation: Story = {
  name: '대화 중',
  args: { activeConversationId: 'p1', messages: [MSG_INTERNAL, MSG_REPORT] },
}

/** 답변을 기다리는 동안. 8초가 넘어가면 지연 안내가 덧붙는다 */
export const Pending: Story = {
  name: '답변 생성 중',
  args: {
    activeConversationId: 'c1',
    messages: [MSG_INTERNAL],
    pendingQuestion: '의료분야 이용기관은 몇 개소인가요?',
  },
}

/**
 * 근거의 「원문 보기」로 패널을 연다. 1280 이상에서는 대화 오른쪽에 붙는 분할 뷰라
 * 대화가 좁아지되 사라지지 않는다 — 답변과 원문을 나란히 읽는 자리다.
 */
export const SourceOpen: Story = {
  name: '원문 패널 열림',
  args: { activeConversationId: 'c1', messages: [MSG_INTERNAL] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: /근거 \d+건/ }))
    /* 근거가 여러 건이면 「원문 보기」도 그 수만큼 선다. 첫 카드를 연다 */
    const open = await canvas.findAllByRole('button', { name: '원문 보기' })
    await userEvent.click(open[0])
  },
}

/** 접으면 사이드바가 아이콘 레일이 되고 대화 카드가 폭을 더 쓴다 */
export const Collapsed: Story = {
  name: '사이드바 접힘 (레일)',
  args: { activeConversationId: 'p1', messages: [MSG_INTERNAL, MSG_REPORT] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: '사이드바 접기' }))
  },
}

/** 오류가 나도 화면을 갈아 끼우지 않는다 — 대화와 입력한 질문은 그대로 두고 띠 하나가 얹힌다 */
export const Problem: Story = {
  name: '오류 띠',
  args: {
    activeConversationId: 'c1',
    messages: [MSG_INTERNAL],
    /* 걸음이 있는 상태다 — 「다시 시도」가 서는지까지 봐야 띠의 높이가 실제와 같다 */
    problem: { kind: 'SERVER', onRetry: () => console.info('[스토리] 다시 시도') },
  },
}

/** 관리자에게만 사용자 메뉴에 「관리자 페이지」가 선다 */
export const Admin: Story = {
  name: '관리자 계정',
  args: { me: { displayName: '이관리', role: 'ADMIN' } },
}

/** 처음 들어온 사람 — 목록 자리에 안내 한 줄만 남는다 */
export const FirstVisit: Story = {
  name: '대화 없음 (첫 방문)',
  args: { conversations: [] },
}

/** 1023 이하 — 사이드바가 서랍으로 들어가고 머리 줄이 선다 (여는 단추는 셸의 몫) */
export const Tablet: Story = {
  name: '태블릿 768',
  args: { activeConversationId: 'c1', messages: [MSG_INTERNAL] },
  globals: { viewport: { value: 'tablet768' } },
}

/** 767 이하 — 대화 카드가 폭을 다 쓰고, 원문 패널은 전체 화면으로 뜬다 */
export const Mobile: Story = {
  name: '모바일 390',
  args: { activeConversationId: 'c1', messages: [MSG_INTERNAL] },
  globals: { viewport: { value: 'mobile390' } },
}
