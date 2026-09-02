import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage, ChatProblem, ChatProblemKind, ConversationSummary } from '../api/types'
import { AppShell } from '../app/AppShell'
import { ChatPage } from '../pages/chat/ChatPage'
import { DEMO_CONVERSATIONS, DEMO_ME, DEMO_MESSAGES, makeDemoReply } from './data/chat'

/**
 * 데모 응답 흉내 — 스트리밍 버전.
 *
 * ⚠ **계약은 아직 동기 응답이다.** API-001 은 답변을 다 만들고 한 번에 돌려주며,
 *   스트리밍 도입 여부는 미정이다(NFR-001 「스트리밍 — 걸림돌이 사라졌다」).
 *   이건 **화면 설계가 스트리밍을 전제해도 되는지 눈으로 보고 정하기 위한 데모**다.
 *   일괄 방식으로 되돌리려면 STREAMING 을 false 로 두면 된다.
 */
const STREAMING = true

/** 데모에서 오류·제한 상태를 열어 보는 낱말 (기획 §10.3 의 7종) */
const DEMO_PROBLEM_TRIGGERS: [string, ChatProblemKind][] = [
  ['서버오류', 'SERVER'],
  ['연결끊김', 'OFFLINE'],
  ['시간초과', 'TIMEOUT'],
  ['인증만료', 'AUTH'],
  ['권한없음', 'FORBIDDEN'],
  ['횟수초과', 'RATE_LIMIT'],
  ['점검중', 'MAINTENANCE'],
]

/** 첫 글자까지의 뜸 — 실제로는 검색·리랭킹 구간이다 */
const FIRST_TOKEN_DELAY_MS = 900
/** 토큰이 붙는 간격과 한 번에 붙는 글자 수 */
const STREAM_TICK_MS = 28
const STREAM_CHUNK = 3
/** 일괄 방식일 때의 대기 시간 */
const BATCH_DELAY_MS = 1600

/**
 * ★ 데모 전용 조립부 — 목업 데이터를 화면에 꽂는 유일한 지점이다.
 *
 * 실연동 시:
 *   1. src/demo/ 폴더를 삭제한다
 *   2. 이 파일이 하던 일(데이터 주입 · 가짜 응답 생성)을 API 클라이언트 + 라우터가 대신한다
 *      — AppShell 의 me            ← API-031 내 정보 조회 (진입 시 1회, SHELL-001)
 *      — AppShell 의 conversations ← API-022 대화 목록
 *      — 대화 선택                  ← API-023 대화 상세
 *      — ChatPage 의 categories    ← API-017 검색 범위 카테고리
 *      — ChatPage 의 messages      ← API-001 질의 응답 누적
 *      — ChatPage 의 onAsk         ← API-001 호출 (아래 ask 자리)
 *      — pendingQuestion           ← 요청이 날아가 있는 동안의 질문
 *      — pendingAnswer             ← **스트리밍을 도입한 경우에만** 부분 답변.
 *                                    동기 응답으로 가면 이 prop 을 넘기지 않으면 된다
 *   화면(src/app, src/pages)과 계약 타입(src/api/types.ts)은 손대지 않는다.
 */
export function DemoApp() {
  /* ★ 진입 상태는 **빈 대화**다 — 화면에 들어오면 시작 화면(오브 + 문구 + 입력창)이 나온다.
     이전 대화는 사이드바 목록에 있고, 골랐을 때만 스트림에 실린다.
     여기에 DEMO_MESSAGES 를 미리 넣어 두면 앱이 뜰 때마다(홈 진입 · 새로고침 · /chat 직접 접속)
     대화 화면으로 떨어져 시작 화면을 볼 수 없다. */
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
  const [problem, setProblem] = useState<ChatProblem | null>(null)
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationSummary[]>(DEMO_CONVERSATIONS)

  /** 진행 중인 흉내를 멈추는 함수. 새 대화·대화 전환·언마운트에서 부른다 */
  const cancelRef = useRef<(() => void) | null>(null)

  const cancel = useCallback(() => {
    cancelRef.current?.()
    cancelRef.current = null
    setPendingQuestion(null)
    setPendingAnswer(null)
  }, [])

  useEffect(() => () => cancelRef.current?.(), [])

  const ask = (query: string) => {
    cancelRef.current?.()

    /* ★ 데모 전용 — 오류·제한 상태(기획 §10.3)를 화면에서 눌러 볼 수 있게 하는 뒷문이다.
       질문에 아래 낱말이 들어가면 그 상태를 띄운다. 실연동에서는 이 블록을 지우고
       API 실패 응답이 setProblem 을 부른다. 상태별 문구는 ChatPage 가 갖고 있다 */
    const trigger = DEMO_PROBLEM_TRIGGERS.find(([word]) => query.includes(word))
    if (trigger) {
      setProblem({ kind: trigger[1], onRetry: () => setProblem(null) })
      return
    }
    setProblem(null)
    const reply = makeDemoReply(query)
    const full = reply.answer ?? ''

    setPendingQuestion(query)
    setPendingAnswer(null)

    const finish = () => {
      setMessages((prev) => [...prev, reply])
      setPendingQuestion(null)
      setPendingAnswer(null)
      cancelRef.current = null
    }

    if (!STREAMING) {
      const t = setTimeout(finish, BATCH_DELAY_MS)
      cancelRef.current = () => clearTimeout(t)
      return
    }

    // 뜸 → 글자가 조금씩 붙음 → 완료 시 확정본(배지·근거 포함)으로 교체
    const startTimer = setTimeout(() => {
      let shown = 0
      const tick = setInterval(() => {
        shown = Math.min(shown + STREAM_CHUNK, full.length)
        setPendingAnswer(full.slice(0, shown))
        if (shown >= full.length) {
          clearInterval(tick)
          finish()
        }
      }, STREAM_TICK_MS)
      cancelRef.current = () => clearInterval(tick)
    }, FIRST_TOKEN_DELAY_MS)

    cancelRef.current = () => clearTimeout(startTimer)
  }

  /** 새 대화 — 실연동 시 conversationId 를 비워 새 세션을 여는 동작에 대응.
      로고·「대화」 메뉴(홈)도 같은 자리로 보낸다 — 이 시스템의 홈은 대화 시작 화면이다 */
  const newConversation = () => {
    cancel()
    setMessages([])
    setActiveConversationId(null)
  }

  /**
   * 질문 수정 후 다시 전송 (기획 §6.1). 고친 턴부터 **뒤를 걷고** 새로 묻는다 —
   * 앞 답변을 남기면 뒤 대화가 고치기 전 질문을 전제로 이어져 문맥이 어긋난다.
   */
  const editResend = (messageId: string, next: string) => {
    const at = messages.findIndex((m) => m.id === messageId)
    if (at < 0) return
    cancel()
    setMessages((prev) => prev.slice(0, at))
    ask(next)
  }

  /** 마지막 답변 다시 생성 — 그 턴을 걷고 같은 질문을 다시 보낸다 (기획 §5.4) */
  const regenerate = () => {
    const last = messages[messages.length - 1]
    if (!last) return
    setMessages((prev) => prev.slice(0, -1))
    ask(last.question)
  }

  /** 대화 삭제 — 실연동 시 삭제 API 를 부른다. 열려 있던 대화면 시작 화면으로 되돌린다 */
  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.conversationId !== id))
    if (activeConversationId === id) {
      cancel()
      setMessages([])
      setActiveConversationId(null)
    }
  }

  /** 대화 고정·해제 — 실연동 시 즐겨찾기 API 를 부른다 */
  const togglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.conversationId === id ? { ...c, pinned: !c.pinned } : c)),
    )
  }

  /** 이전 채팅 선택 — 실연동 시 API-023 으로 그 대화의 메시지를 받아 온다 */
  const selectConversation = (id: string) => {
    cancel()
    setActiveConversationId(id)
    setMessages(id === 'v1' ? DEMO_MESSAGES : [])
  }

  return (
    <AppShell
      me={DEMO_ME}
      conversations={conversations}
      activeConversationId={activeConversationId}
      onSelectConversation={selectConversation}
      onDeleteConversation={deleteConversation}
      onTogglePinConversation={togglePin}
      onNewConversation={newConversation}
      onHome={newConversation}
      onHelp={() => console.info('[데모] 도움말')}
      /* 실연동 시 SSO 로그아웃으로 간다 (기획 §14 미확정) */
      onLogout={() => console.info('[데모] 로그아웃')}
    >
      <ChatPage
        messages={messages}
        pendingQuestion={pendingQuestion}
        pendingAnswer={pendingAnswer}
        onAsk={ask}
        onFeedback={(f) => console.info('[데모] 피드백', f)}
        onRegenerate={messages.length > 0 ? regenerate : undefined}
        onStop={pendingQuestion ? cancel : undefined}
        onEditResend={editResend}
        problem={problem}
      />
    </AppShell>
  )
}
