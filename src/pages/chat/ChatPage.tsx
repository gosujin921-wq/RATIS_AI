import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Category, ChatMessage, ChatProblem, Evidence, Feedback } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/custom/IconButton'
import { useMediaQuery } from '../../components/custom/useMediaQuery'
import { useReducedMotion } from '../../components/custom/useReducedMotion'
import { Answer } from '../../components/custom/Answer'
import { ChatIntro } from '../../components/custom/ChatIntro'
import { Composer } from '../../components/custom/Composer'
import { PendingAnswer } from '../../components/custom/PendingAnswer'
import { ProblemBanner } from '../../components/custom/ProblemBanner'
import { QuestionBubble } from '../../components/custom/QuestionBubble'
import { SuggestedQuestions } from '../../components/custom/SuggestedQuestions'
import type { SourceStatus } from '../../components/custom/SourcePanel'
import { SourcePanel } from '../../components/custom/SourcePanel'
import './ChatPage.css'

/**
 * SCREEN-001 대화 — 이 시스템의 중심 화면.
 *
 * 이 파일이 하는 일은 **자리와 상태**뿐이다. 턴 하나가 어떻게 생겼는지, 답변 아래 무엇이
 * 붙는지, 입력칸이 어떻게 자라는지는 각 부품이 안다 (components/custom).
 *
 * 스크롤 구조 (docs/reference/products/01 · 04):
 *   셸이 화면 높이를 잡고 → **대화 스트림 한 곳만** 세로 스크롤 →
 *   입력창은 하단 도킹. 컴포저와 스트림은 **같은 max-width 를 공유**한다 (ChatGPT 관례).
 *
 * 화면이 반드시 구분해 표시하는 것 (SCREEN-001 ★)은 답변 부품이 진다 (Answer.tsx):
 *   ① 근거 유형 INTERNAL / EXTERNAL / BLOCKED — 문구로 구분 (AC-085)
 *   ② 「접근 가능한 자료 없음」과 「근거를 못 찾음」은 다른 문구 (AC-016)
 *   ③ scopeNarrowed → 범위를 넓혀 재시도 안내 (AC-034)
 *
 * 오른쪽 근거 패널 (2026-09-14 협회 의견 「근거를 우측 화면에 바로」):
 *   PC(1280~)  답변이 오면 그 답변의 근거 목록이 **저절로** 옆에 선다. 닫으면 그 답변에는
 *              다시 열지 않고, 다음 답변이 오면 다시 선다
 *   그 아래    저절로 열지 않는다 — 덮는 패널이라 답변을 가린다. 답변의 「근거 n건」·인용 칩이
 *              열어 준다
 */

/** 대기가 이만큼 넘어가면 지연 안내를 덧붙인다 (NFR-001 목표 10초보다 앞서) */
const SLOW_HINT_MS = 8000

/** 질의문 최대 길이 (AC-025) */
const QUERY_MAX = 2000

/** 근거 패널이 대화 옆에 나란히 서는 폭 — SourcePanel.css · ChatPage.css 의 분기와 같은 값 */
const SPLIT_VIEW_QUERY = '(min-width: 1280px)'

/** 오른쪽 패널의 상태. null 이면 닫힘 */
type Panel =
  | { view: 'list'; messageId: string }
  | { view: 'page'; evidence: Evidence; from: string | null }

export function ChatPage({
  messages,
  categories = [],
  suggestions = [],
  pendingQuestion,
  pendingAnswer,
  onAsk,
  onFeedback,
  onStop,
  onDownloadSource,
  getPageText,
  problem,
}: {
  /** 이 대화의 질의응답 턴들 */
  messages: ChatMessage[]
  /**
   * 검색 범위 카테고리 (API-017). 입력줄 안 드롭다운으로 선다.
   * 비어 오면 그 자리를 그리지 않는다 — 고를 것이 없는 필터는 자리만 먹는다.
   */
  categories?: Category[]
  /**
   * 시작 화면 추천 질문 (2026-09-14). 입력창 아래 칩으로 서고, 누르면 바로 보낸다.
   * 비어 오면 줄을 그리지 않는다. ⚠ 어디서 오는지는 개발 협의 항목이다 (기획 §14).
   */
  suggestions?: readonly string[]
  /** 응답 대기 중인 질문 — 있으면 스트림 끝에 「답변 생성 중」 턴을 그린다 */
  pendingQuestion?: string | null
  /**
   * 지금까지 도착한 **부분 답변**. 스트리밍을 쓸 때만 채워진다.
   * ⚠ 계약(API-001)은 아직 **동기 응답**이고 스트리밍 도입 여부는 미정이다(NFR-001).
   *   비워 두면 화면은 종전대로 「생성 중 → 완성본」 흐름으로 동작한다.
   */
  pendingAnswer?: string | null
  /**
   * 질문하기 — 실연동 시 API-001 호출부가 들어온다.
   * 고른 검색 범위를 함께 넘긴다. 비었으면 전체에서 찾는다는 뜻이다.
   * ⚠ 질의에 범위를 싣는 필드명은 계약 확정 전이다 (기획 §14 미확정 항목).
   */
  onAsk?: (query: string, categoryIds?: string[]) => void
  /** 답변 피드백 (기획 §9). 저장·관리자 연계는 개발 영역이라 화면은 넘기기만 한다 */
  onFeedback?: (feedback: Feedback) => void
  /** 생성 중단. 넘기지 않으면 중단 버튼이 서지 않는다 */
  onStop?: () => void
  /**
   * 원문 파일 하나를 받는다. 패널의 근거 카드와 원문 도구 줄이 **같은 걸음**을 쓴다 —
   * 두 자리가 같은 파일을 주는데 핸들러가 갈리면 한쪽만 고쳐지는 사고가 난다
   */
  onDownloadSource?: (evidence: Evidence) => void
  /**
   * 원문 패널에 그릴 **그 쪽의 글자**. 실제 뷰어(PDF)가 붙기 전까지의 자리다.
   * 데모에서는 원본 PDF 에서 뽑은 글자가 오고, 실연동에서는 뷰어가 이 자리를 대신한다.
   */
  getPageText?: (evidence: Evidence, page: number) => string | undefined
  /**
   * 오류·제한 상태 (기획 §10.3). 없으면 평소 화면이다.
   * ★ 오류가 나도 **이미 표시된 대화와 입력한 질문은 유지한다** — 기획이 못박은 조건이라
   *   화면을 갈아 끼우지 않고 대화 위에 띠로 얹는다.
   */
  problem?: ChatProblem | null
}) {
  const [query, setQuery] = useState('')
  /**
   * 고른 검색 범위 (기획 §5.3 확장 영역 · §12.2 「지식영역 선택」).
   * 대화 내내 유지된다 — 질문마다 다시 고르게 하면 이어 묻는 흐름이 매번 끊긴다.
   */
  const [scope, setScope] = useState<string[]>([])
  const [slow, setSlow] = useState(false)
  /** 위를 읽는 중에 새 답변이 왔는가 */
  const [hasNew, setHasNew] = useState(false)
  /** 한 화면 넘게 내려왔는가. 「맨 위로」는 그때만 선다 */
  const [deep, setDeep] = useState(false)
  const reduceMotion = useReducedMotion()
  /** 패널이 대화 옆에 나란히 서는 폭인가. 저절로 여는 것은 이때뿐이다 */
  const splitView = useMediaQuery(SPLIT_VIEW_QUERY)

  /* 오른쪽 근거 패널 — 기획 §5.5. 화면을 떠나지 않고 근거를 확인한다.
     원문 상태를 화면이 들고 있는 까닭: 실제 뷰어(PDF)는 개발 영역이라 아직 없고, 그 자리가
     가질 수 있는 상태를 화면이 먼저 잡아 둬야 나중에 붙일 때 레이아웃이 안 흔들린다 */
  const [panel, setPanel] = useState<Panel | null>(null)
  const [sourceStatus, setSourceStatus] = useState<SourceStatus>('ready')
  const [sourcePage, setSourcePage] = useState<number | null>(null)
  /** 사용자가 닫은 답변. 그 답변에는 패널을 다시 저절로 열지 않는다 */
  const dismissedRef = useRef<string | null>(null)

  const streamRef = useRef<HTMLDivElement>(null)
  /** 바닥 근처에 있을 때만 새 턴을 따라 내려간다 — 위를 읽는 중이면 끌어내리지 않는다 */
  const stickBottomRef = useRef(true)

  const pending = Boolean(pendingQuestion)
  const empty = messages.length === 0 && !pending

  const openList = (messageId: string) => setPanel({ view: 'list', messageId })

  const openSource = (e: Evidence, from: string | null) => {
    setPanel({ view: 'page', evidence: e, from })
    setSourcePage(e.pageNo)
    /* 여는 순간엔 늘 로딩부터다 — 뷰어가 붙으면 이 자리가 실제 로드 결과로 바뀐다 */
    setSourceStatus('loading')
    setTimeout(() => setSourceStatus('ready'), 600)
  }

  const closePanel = () => {
    if (panel) dismissedRef.current = panel.view === 'list' ? panel.messageId : panel.from
    setPanel(null)
  }

  /* 답변이 오면 PC 에서는 그 답변의 근거 목록이 저절로 선다. 마지막 답변이 근거 없는
     답변(외부 응답·차단)이면 열지 않는다 — 빈 목록을 띄울 이유가 없다.
     대화가 비면(새 대화) 패널도 걷는다 */
  useEffect(() => {
    if (messages.length === 0) {
      setPanel(null)
      dismissedRef.current = null
      return
    }
    if (!splitView) return
    const last = messages[messages.length - 1]
    if (last.evidences.length === 0 || dismissedRef.current === last.id) return
    setPanel({ view: 'list', messageId: last.id })
  }, [messages, splitView])

  const scrollToBottom = () => {
    const el = streamRef.current
    if (el) el.scrollTop = el.scrollHeight
    setHasNew(false)
  }

  const handleStreamScroll = () => {
    const el = streamRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    stickBottomRef.current = nearBottom
    if (nearBottom) setHasNew(false)
    /* 기준을 픽셀로 박지 않는다 — **한 화면**만큼 내려왔으면 처음 질문이 화면 밖으로
       나갔다는 뜻이고, 그때부터 되돌아갈 길이 필요하다 */
    setDeep(el.scrollTop > el.clientHeight)
  }

  /** 대화 맨 처음으로. 스크롤은 스트림 하나만 지므로 창이 아니라 그 상자를 올린다 */
  const scrollToTop = () => {
    streamRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  /* 턴이 늘면: 바닥에 있었으면 따라가고, 아니면 「새 답변」 버튼만 세운다.
     대화가 비면(새 대화) 안내 버튼도 함께 걷는다 */
  useEffect(() => {
    if (messages.length === 0 && !pendingQuestion) {
      stickBottomRef.current = true
      setHasNew(false)
      return
    }
    if (stickBottomRef.current) scrollToBottom()
    else setHasNew(true)
  }, [messages.length, pendingQuestion])

  /* 스트리밍으로 본문이 길어지는 동안에도 바닥에 붙어 있으면 따라간다 */
  useEffect(() => {
    if (pendingAnswer && stickBottomRef.current) scrollToBottom()
  }, [pendingAnswer])

  /* 패널은 Esc 로도 닫는다 — 덮고 있는 화면에서 나가는 길이 X 하나뿐이면 갇힌다 */
  useEffect(() => {
    if (!panel) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panel])

  /* 대기가 길어지면 지연 안내 */
  useEffect(() => {
    setSlow(false)
    if (!pendingQuestion) return
    const t = setTimeout(() => setSlow(true), SLOW_HINT_MS)
    return () => clearTimeout(t)
  }, [pendingQuestion])

  const ask = (text: string) => {
    const trimmed = text.trim()
    if (trimmed.length === 0 || pending) return
    stickBottomRef.current = true // 내가 보낸 질문은 항상 따라간다
    onAsk?.(trimmed, scope.length > 0 ? scope : undefined)
  }

  const submit = () => {
    ask(query)
    setQuery('')
  }

  /* 패널에 실을 것 — 목록 모드면 그 답변의 근거, 원문 모드면 근거 하나 */
  const panelMessage =
    panel?.view === 'list' ? messages.find((m) => m.id === panel.messageId) : undefined
  const panelEvidence = panel?.view === 'page' ? panel.evidence : null

  return (
    /* 대화와 근거 패널이 나란히 선다. 패널이 없으면 대화가 폭을 다 쓴다 */
    <div className="chat-layout" data-source={panel ? 'open' : undefined}>
      <div className="chat-page" data-empty={empty}>
        {/* ── 대화 스트림 — 이 영역 하나만 스크롤한다 ─────────────────── */}
        <div className="chat-scroll" ref={streamRef} onScroll={handleStreamScroll}>
          <div className="chat-inner">
            {empty ? (
              <ChatIntro />
            ) : (
              /* role="log" — 새 메시지를 순서대로 읽어준다. 접근 가능한 이름 필수 */
              <section className="chat-stream" role="log" aria-labelledby="chat-stream-title">
                <h2 id="chat-stream-title" className="visually-hidden">
                  대화 내용
                </h2>

                {messages.map((m) => (
                  <div key={m.id} className="chat-turn">
                    <QuestionBubble question={m.question} />
                    <Answer
                      message={m}
                      onFeedback={onFeedback}
                      onOpenSource={(e) => openSource(e, m.id)}
                      onOpenEvidences={() => openList(m.id)}
                    />
                  </div>
                ))}

                {pendingQuestion && (
                  <PendingAnswer question={pendingQuestion} partial={pendingAnswer} slow={slow} />
                )}
              </section>
            )}
          </div>
        </div>

        {/* ── 입력 영역 — 하단 도킹. 스트림과 같은 폭을 공유한다 ───────── */}
        <div className="chat-dock">
          {problem && (
            <div className="chat-inner chat-dock-problem">
              <ProblemBanner problem={problem} />
            </div>
          )}
          {/* 입력창 바로 위 가운데 — 대화를 오르내리는 두 조작이 서는 자리.
              「맨 위로」는 한 화면 넘게 내려왔을 때, 「새 답변」은 위를 읽는 중에 답이 왔을 때.
              둘이 동시에 설 수 있어 한 줄에 묶는다 (따로 두면 겹친다) */}
          {(deep || hasNew) && (
            <div className="chat-dock-actions">
              {deep && (
                <IconButton
                  size="lg"
                  shape="circle"
                  aria-label="대화 맨 위로"
                  className="chat-top"
                  onClick={scrollToTop}
                >
                  <ChevronUp aria-hidden />
                </IconButton>
              )}
              {hasNew && (
                <Button variant="secondary" size="small" className="chat-jump" onClick={scrollToBottom}>
                  새 답변 <ChevronDown size={14} aria-hidden />
                </Button>
              )}
            </div>
          )}
          <div className="chat-inner">
            <Composer
              value={query}
              onChange={setQuery}
              onSubmit={submit}
              onStop={onStop}
              pending={pending}
              categories={categories}
              scope={scope}
              onScopeChange={setScope}
              maxLength={QUERY_MAX}
            />
            {/* 추천 질문 — 시작 화면에서만, 입력창 바로 아래 (2026-09-14). 누르면 바로 보낸다 */}
            {empty && <SuggestedQuestions questions={suggestions} onPick={ask} disabled={pending} />}
          </div>
        </div>
      </div>

      {panel && (
        <SourcePanel
          view={panel.view}
          evidences={panelMessage?.evidences ?? []}
          onSelect={(e) => openSource(e, panel.view === 'list' ? panel.messageId : panel.from)}
          onBack={panel.view === 'page' && panel.from ? () => openList(panel.from!) : undefined}
          evidence={panelEvidence}
          status={sourceStatus}
          page={sourcePage}
          pageText={
            panelEvidence && sourcePage ? getPageText?.(panelEvidence, sourcePage) : undefined
          }
          pageCount={panelEvidence?.pageCount}
          onPageChange={setSourcePage}
          onDownload={onDownloadSource}
          onRetry={() => {
            setSourceStatus('loading')
            setTimeout(() => setSourceStatus('ready'), 600)
          }}
          onClose={closePanel}
        />
      )}
    </div>
  )
}
