import { useEffect, useRef, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { Badge, Button, Disclosure, Textarea } from 'krds-react'
import { ArrowUp, Check, ChevronDown, Copy, FileText, Flag, Frown, Info, Pencil, RotateCcw, Smile, Square, Table2, X } from 'lucide-react'

/**
 * 킷 1.1.1 타입은 Disclosure 의 buttonText 를 string 으로 잡아 뒀다. 런타임은 그대로
 * children 으로 렌더하므로 ReactNode 가 들어간다 — 토글 이름 안에 요약값을 다른 급으로
 * 세워야 해서 캐스팅한다 (ChipGroup 이 RadioChip 에 쓰는 것과 같은 처리).
 */
const Expand = Disclosure as unknown as (
  p: Omit<ComponentProps<typeof Disclosure>, 'buttonText'> & { buttonText: ReactNode },
) => ReactNode
import { Alert } from '../../components/custom/Alert'
import { AnswerBody } from '../../components/custom/AnswerBody'
import { HeroCubes } from '../../components/custom/HeroCubes'
import { IconButton } from '../../components/custom/IconButton'
import type { SourceStatus } from '../../components/custom/SourcePanel'
import { SourcePanel } from '../../components/custom/SourcePanel'
import type { ChatMessage, ChatProblem, Evidence, Feedback, FeedbackReason } from '../../api/types'
import { FEEDBACK_REASONS } from '../../api/types'
import { ChipGroup } from '../../components/custom/ChipGroup'
import './ChatPage.css'

/**
 * SCREEN-001 대화 — 이 시스템의 중심 화면.
 *
 * 스크롤 구조 (docs/reference/products/01 · 04):
 *   셸이 화면 높이를 잡고 → **대화 스트림 한 곳만** 세로 스크롤 →
 *   입력창은 하단 도킹, 검색 범위는 입력창에 붙는다.
 *   컴포저와 스트림은 **같은 max-width 를 공유**한다 (ChatGPT 관례).
 *
 * 화면이 반드시 구분해 표시하는 것 (SCREEN-001 ★):
 *   ① evidenceType INTERNAL / EXTERNAL / BLOCKED — 배지 문구로 구분 (AC-085)
 *   ② 「접근 가능한 자료 없음」과 「근거를 못 찾음」은 다른 문구 (AC-016)
 *   ③ scopeNarrowed → 범위를 넓혀 재시도 안내 (AC-034)
 */

/**
 * 시작 화면 추천 질문 (기획 §5.3 · §12.1 필수). 문구는 기획서 예시 그대로다.
 * 무엇을 물어도 되는지 모르는 첫 화면에서, 답할 수 있는 범위를 예시로 보여 주는 자리다.
 */
const SUGGESTED_QUESTIONS = [
  '최근 방사선산업 실태조사의 주요 결과를 요약해 주세요.',
  '연도별 방사선 이용기관 수를 표로 보여주세요.',
  '관련 보고서에서 인력 현황을 찾아 비교해 주세요.',
]

/**
 * 오류·제한 상태별 문구 (기획 §10.3).
 * 사용자가 **지금 뭘 할 수 있는지**를 함께 적는다 — 「오류가 발생했습니다」만 있으면
 * 기다려야 하는지 다시 눌러야 하는지 알 수 없다.
 */
const PROBLEM_TEXT: Record<
  ChatProblem['kind'],
  { tone: 'danger' | 'warning' | 'info'; title: string; desc: string; retry?: string }
> = {
  SERVER: {
    tone: 'danger',
    title: '일시적인 오류가 발생했습니다',
    desc: '잠시 후 다시 시도해 주세요. 입력하신 질문과 대화는 그대로 있습니다.',
    retry: '다시 시도',
  },
  OFFLINE: {
    tone: 'warning',
    title: '네트워크에 연결되어 있지 않습니다',
    desc: '연결을 확인한 뒤 다시 시도해 주세요.',
    retry: '다시 시도',
  },
  TIMEOUT: {
    tone: 'warning',
    title: '응답이 너무 오래 걸립니다',
    desc: '지금 접속이 몰렸을 수 있습니다. 잠시 후 다시 질문해 주세요.',
    retry: '다시 시도',
  },
  AUTH: {
    tone: 'info',
    title: '로그인이 만료되었습니다',
    desc: '다시 로그인하면 이 대화에서 이어서 질문할 수 있습니다.',
    retry: '다시 로그인',
  },
  FORBIDDEN: {
    tone: 'danger',
    title: '이 대화에 접근할 권한이 없습니다',
    desc: '본인이 만든 대화만 열 수 있습니다.',
  },
  RATE_LIMIT: {
    tone: 'warning',
    title: '요청이 너무 많습니다',
    desc: '잠시 후 다시 질문해 주세요.',
  },
  MAINTENANCE: {
    tone: 'info',
    title: '서비스 점검 중입니다',
    desc: '점검이 끝나면 정상적으로 이용할 수 있습니다.',
  },
}

/** 대기가 이만큼 넘어가면 지연 안내를 덧붙인다 (NFR-001 목표 10초보다 앞서) */
const SLOW_HINT_MS = 8000

/**
 * 입력칸이 자라는 최대 줄 수. 다섯 줄을 넘으면 안에서 스크롤한다 —
 * 계속 늘어나게 두면 긴 질문을 쓸수록 대화가 화면 밖으로 밀려 방금 읽던 답변을 잃는다.
 */
const MAX_INPUT_LINES = 5

/** 질의문 최대 길이 — 0자·초과는 400 이다 (AC-025) */
const QUERY_MAX = 2000

const EVIDENCE_TYPE_LABEL = {
  INTERNAL: '내부 자료 근거',
  EXTERNAL: '외부 LLM 응답',
  BLOCKED: '차단됨',
} as const

/** 근거 유형별 배지 색 — 내부는 브랜드, 외부는 주의, 차단은 경고 */
const EVIDENCE_TYPE_COLOR = {
  INTERNAL: 'primary',
  EXTERNAL: 'warning',
  BLOCKED: 'danger',
} as const

function EvidenceTypeBadge({ type }: { type: ChatMessage['evidenceType'] }) {
  return (
    <Badge variant="light" color={EVIDENCE_TYPE_COLOR[type]} size="small" rounded>
      {EVIDENCE_TYPE_LABEL[type]}
    </Badge>
  )
}

function EvidenceCard({
  evidence,
  onOpenSource,
}: {
  evidence: Evidence
  onOpenSource?: (e: Evidence) => void
}) {
  const Icon = evidence.blockType === 'table' ? Table2 : FileText
  return (
    <article className="chat-evidence-card">
      {/* 출처 계층 — 카테고리 › 문서 › 구역·표 › 쪽 (법률구조공단 브레드크럼 방식) */}
      <p className="chat-evidence-path">
        <span>{evidence.categoryName}</span>
        {(evidence.tableTitle ?? evidence.sectionName) && <span>{evidence.tableTitle ?? evidence.sectionName}</span>}
        {evidence.pageNo !== null && <span>{evidence.pageNo}쪽</span>}
      </p>
      <header className="chat-evidence-head">
        <Icon size={16} aria-hidden />
        <h4 className="chat-evidence-doc">{evidence.documentTitle}</h4>
      </header>
      {evidence.blockType === 'table' ? (
        <div className="chat-evidence-table" dangerouslySetInnerHTML={{ __html: evidence.chunkContent }} />
      ) : (
        <p className="chat-evidence-text">{evidence.chunkContent}</p>
      )}
      {/* ★ 캡션(단위·주·출처) 생략 금지 — 빠지면 수치가 맞아도 오독된다 (NFR-008) */}
      {evidence.caption && <p className="chat-evidence-caption">{evidence.caption}</p>}
      {/* 페이지를 벗어나지 않는다 — 오른쪽 패널로 연다 (기획 §5.5) */}
      <Button variant="tertiary" size="small" onClick={() => onOpenSource?.(evidence)}>
        원문 보기
      </Button>
    </article>
  )
}

/** 답변 소속 근거 — 접이식. 대화가 쌓여도 각 답변이 자기 근거를 들고 있다 */
function EvidenceDisclosure({
  evidences,
  id,
  onOpenSource,
}: {
  evidences: Evidence[]
  id: string
  onOpenSource?: (e: Evidence) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    /* aria-expanded·aria-controls·패널 id 를 손으로 잇지 않는다 — Disclosure 가 진다 */
    <Expand
      className="chat-evidences"
      id={id}
      buttonText={`근거 ${evidences.length}건`}
      expanded={open}
      onToggle={setOpen}
    >
      <div className="chat-evidences-list">
        {evidences.map((e) => (
          <EvidenceCard key={e.chunkId} evidence={e} onOpenSource={onOpenSource} />
        ))}
      </div>
    </Expand>
  )
}

/**
 * 답변 피드백 (기획 §9) — 도움이 됐어요 · 도움이 안 됐어요 · 오류 신고.
 *
 * 부정 피드백과 오류 신고는 **같은 자리를 연다** — 기획이 둘에 같은 사유 목록을 붙였고,
 * 사용자가 「부정확함」을 고를 때 그것이 평가인지 신고인지 스스로 갈라야 할 이유가 없다.
 * 신고 버튼은 사유가 「화면 또는 기능 오류」로 먼저 잡힌 채 열리는 같은 폼이다.
 *
 * 제출하면 폼을 걷고 완료 문구만 남긴다 (기획: 제출 완료 상태).
 * 저장·관리자 연계는 개발 영역이라 여기서는 onSubmit 으로 넘기고 끝난다.
 */
function FeedbackBar({ id, onSubmit }: { id: string; onSubmit?: (f: Feedback) => void }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState<Feedback | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [reasons, setReasons] = useState<FeedbackReason[]>([])
  const [comment, setComment] = useState('')

  /* 닫은 답변에는 다시 묻지 않는다 — 매 답변마다 되살아나면 물음이 아니라 방해가 된다 */
  if (dismissed) return null

  if (done) {
    return (
      <div className="chat-feedback-box" role="status">
        <Check size={16} aria-hidden className="chat-feedback-done-icon" />
        <p className="chat-feedback-done">의견 고맙습니다. 답변을 개선하는 데 쓰겠습니다.</p>
      </div>
    )
  }

  const openWith = (preset: FeedbackReason[]) => {
    setReasons(preset)
    setOpen(true)
  }

  const titleId = `${id}-feedback`

  return (
    <div className="chat-feedback-box" role="group" aria-labelledby={titleId}>
      <div className="chat-feedback-head">
        <p className="chat-feedback-title" id={titleId}>
          이 답변이 도움이 되었나요?
        </p>
        {/* 평가하지 않고 닫는 길. 아이콘만이라 이름을 준다 (기획 §11) */}
        <IconButton
          size="sm"
          aria-label="피드백 닫기"
          onClick={() => setDismissed(true)}
        >
          <X aria-hidden />
        </IconButton>
      </div>

      <div className="chat-feedback-row">
        <button
          type="button"
          className="chat-feedback-pick"
          onClick={() => {
            const f: Feedback = { helpful: true }
            onSubmit?.(f)
            setDone(f)
          }}
        >
          <Smile size={18} aria-hidden />
          도움이 됐어요
        </button>
        <button type="button" className="chat-feedback-pick" onClick={() => openWith([])}>
          <Frown size={18} aria-hidden />
          도움이 안 됐어요
        </button>
        <button
          type="button"
          className="chat-feedback-pick"
          data-tone="report"
          onClick={() => openWith(['화면 또는 기능 오류'])}
        >
          <Flag size={18} aria-hidden />
          오류 신고
        </button>
      </div>

      {open && (
        <div className="chat-feedback-form">
          <ChipGroup
            label="그렇게 생각한 이유"
            options={FEEDBACK_REASONS.map((r) => ({ value: r, label: r }))}
            value={reasons}
            onChange={setReasons}
            size="small"
          />
          <Textarea
            label="추가 의견 (선택)"
            rows={2}
            placeholder="어떤 점이 아쉬웠는지 알려주세요"
            value={comment}
            onChange={setComment}
          />
          <div className="chat-feedback-steps">
            <Button variant="text" size="small" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={() => {
                const f: Feedback = {
                  helpful: false,
                  reasons: reasons.length > 0 ? reasons : undefined,
                  comment: comment.trim() || undefined,
                }
                onSubmit?.(f)
                setDone(f)
              }}
            >
              보내기
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <Button
      variant="text"
      size="small"
      className="chat-action"
      onClick={() => {
        void navigator.clipboard?.writeText(text)
        setDone(true)
        setTimeout(() => setDone(false), 1600)
      }}
    >
      {done ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
      {done ? '복사됨' : '복사'}
    </Button>
  )
}

/** AI 답변 한 건 */
function Answer({
  message,
  isLast,
  onAsk,
  onFeedback,
  onRegenerate,
  onOpenSource,
}: {
  message: ChatMessage
  isLast: boolean
  onAsk?: (q: string) => void
  onFeedback?: (f: Feedback) => void
  onRegenerate?: () => void
  onOpenSource?: (e: Evidence) => void
}) {
  return (
    <div className="chat-answer" data-last={isLast}>
      {/* 스크린리더가 화자를 알 수 있게 — 위치로만 구분하면 WCAG 1.3.1·1.3.3 위반 */}
      <span className="visually-hidden">RATIS AI 답변:</span>

      <div className="chat-answer-meta">
        <EvidenceTypeBadge type={message.evidenceType} />
        {message.composition && <span className="chat-composition">적용된 구성: {message.composition}</span>}
      </div>

      {message.notice && (
        <Alert tone={message.evidenceType === 'BLOCKED' ? 'danger' : 'primary'} title={message.notice}>
          {null}
        </Alert>
      )}

      {message.scopeNarrowed && (
        <Alert tone="info" title="선택한 범위에서 찾지 못했습니다">
          검색 범위를 넓혀 다시 시도해 보세요.
        </Alert>
      )}

      {/* 제목·목록·표·인용까지 그린다 (기획 §7) */}
      {message.answer && <AnswerBody className="chat-answer-body" text={message.answer} />}

      {message.evidences.length > 0 && (
        <EvidenceDisclosure
          evidences={message.evidences}
          id={message.id}
          onOpenSource={onOpenSource}
        />
      )}

      {/* 답변별 고지 — 국내 공공 관행(정부24·법률구조공단)을 따른다 */}
      {message.evidenceType !== 'BLOCKED' && (
        <p className="chat-disclaimer">
          <Info size={13} aria-hidden />
          AI가 생성한 답변으로 실제와 다를 수 있습니다. 수치는 근거 원문에서 확인하세요.
        </p>
      )}

      {message.answer && (
        <div className="chat-actions">
          <CopyButton text={message.answer} />
          {/* 다시 생성 — 마지막 답변에만. 중간 턴을 다시 만들면 뒤 대화와 어긋난다 */}
          {isLast && onRegenerate && (
            <Button variant="text" size="small" className="chat-action" onClick={onRegenerate}>
              <RotateCcw size={15} aria-hidden />
              다시 생성
            </Button>
          )}
        </div>
      )}

      {/* 피드백 — 차단된 답변에는 묻지 않는다 (평가할 답변이 없다) */}
      {message.evidenceType !== 'BLOCKED' && <FeedbackBar id={message.id} onSubmit={onFeedback} />}

      {/* 후속 추천 질문 — 마지막 답변 아래에만 세운다 */}
      {isLast && message.followUps && message.followUps.length > 0 && (
        <SuggestionList label="이어서 물어보기" items={message.followUps} onPick={onAsk} />
      )}
    </div>
  )
}

/**
 * 추천 질문 줄 — 시작 화면(§5.3)과 답변 아래 후속 질문(§5.4)이 같은 부품을 쓴다.
 * 두 자리의 뜻이 같기 때문이다: **다음에 뭘 물으면 되는지 보여 준다.**
 */
function SuggestionList({
  label,
  items,
  onPick,
}: {
  label: string
  items: string[]
  onPick?: (q: string) => void
}) {
  return (
    /* 묶음 이름은 화면에 적지 않는다 — 카드 셋이 나란히 서면 「고르는 자리」라는 게
       모양으로 읽힌다. 보조기술에는 aria-label 로 남긴다 */
    <ul className="chat-suggest" aria-label={label}>
      {items.map((q) => (
        <li key={q}>
          <button type="button" className="chat-suggest-item" onClick={() => onPick?.(q)}>
            {q}
          </button>
        </li>
      ))}
    </ul>
  )
}

export function ChatPage({
  messages,
  pendingQuestion,
  pendingAnswer,
  onAsk,
  onFeedback,
  onRegenerate,
  onStop,
  onEditResend,
  problem,
}: {
  /** 이 대화의 질의응답 턴들 */
  messages: ChatMessage[]
  /** 응답 대기 중인 질문 — 있으면 스트림 끝에 「답변 생성 중」 턴을 그린다 */
  pendingQuestion?: string | null
  /**
   * 지금까지 도착한 **부분 답변**. 스트리밍을 쓸 때만 채워진다.
   *
   * ★ 이 값이 있어도 **근거 유형 배지·근거 목록은 그리지 않는다.**
   *   둘은 응답이 끝나야 확정되는데, 내부 근거인 줄 알고 읽었다가 끝나서 외부 LLM 응답이면
   *   AC-026 불변식이 깨진다. 확정 표시는 답변이 완료된 뒤에만 한다.
   *
   * ⚠ 계약(API-001)은 아직 **동기 응답**이고 스트리밍 도입 여부는 미정이다(NFR-001).
   *   비워 두면 화면은 종전대로 「생성 중 → 완성본」 흐름으로 동작한다.
   */
  pendingAnswer?: string | null
  /** 질문하기 — 실연동 시 API-001 호출부가 들어온다 */
  onAsk?: (query: string) => void
  /** 답변 피드백 (기획 §9). 저장·관리자 연계는 개발 영역이라 화면은 넘기기만 한다 */
  onFeedback?: (feedback: Feedback) => void
  /** 마지막 답변 다시 생성 */
  onRegenerate?: () => void
  /** 생성 중단. 넘기지 않으면 중단 버튼이 서지 않는다 */
  onStop?: () => void
  /** 질문 수정 후 다시 전송 (기획 §6.1). 그 턴부터 뒤를 걷고 새로 묻는다 */
  onEditResend?: (messageId: string, query: string) => void
  /**
   * 화면 전체를 막는 오류·제한 상태 (기획 §10.3). 없으면 평소 화면이다.
   * ★ 오류가 나도 **이미 표시된 대화와 입력한 질문은 유지한다** — 기획이 못박은 조건이라
   *   화면을 갈아 끼우지 않고 대화 위에 띠로 얹는다.
   */
  problem?: ChatProblem | null
}) {
  const [query, setQuery] = useState('')
  /** 수정 중인 질문의 턴 id. null 이면 아무것도 고치고 있지 않다 */
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [slow, setSlow] = useState(false)

  /* 원문 패널 — 기획 §5.5. 화면을 떠나지 않고 근거를 확인한다.
     status·page·zoom 을 화면이 들고 있는 까닭: 실제 뷰어(PDF)는 개발 영역이라 아직 없고,
     그 자리가 가질 수 있는 상태를 화면이 먼저 잡아 둬야 나중에 붙일 때 레이아웃이 안 흔들린다 */
  const [source, setSource] = useState<Evidence | null>(null)
  const [sourceStatus, setSourceStatus] = useState<SourceStatus>('ready')
  const [sourcePage, setSourcePage] = useState<number | null>(null)
  const [sourceZoom, setSourceZoom] = useState(100)

  const openSource = (e: Evidence) => {
    setSource(e)
    setSourcePage(e.pageNo)
    setSourceZoom(100)
    /* 여는 순간엔 늘 로딩부터다 — 뷰어가 붙으면 이 자리가 실제 로드 결과로 바뀐다 */
    setSourceStatus('loading')
    setTimeout(() => setSourceStatus('ready'), 600)
  }
  const [hasNew, setHasNew] = useState(false)

  const streamRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  /**
   * 지금 몇 줄인가. 1이면 **캡슐**, 그 위로는 라운드 스퀘어가 된다 (모양이 곧 상태다 —
   * 한 줄일 때는 「한 마디 묻는 자리」로, 길어지면 「글을 쓰는 자리」로 읽힌다).
   */
  const [lines, setLines] = useState(1)
  /** 바닥 근처에 있을 때만 새 턴을 따라 내려간다 — 위를 읽는 중이면 끌어내리지 않는다 */
  const stickBottomRef = useRef(true)

  const pending = Boolean(pendingQuestion)
  const empty = messages.length === 0 && !pending

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

  /* 스트리밍으로 본문이 길어지는 동안에도 바닥에 붙어 있으면 따라간다.
     위를 읽는 중이면 끌어내리지 않는다 */
  useEffect(() => {
    if (pendingAnswer && stickBottomRef.current) scrollToBottom()
  }, [pendingAnswer])

  /* 입력한 만큼만 자란다. 킷 Textarea 는 rows 로 높이가 고정돼 있어 여기서 직접 잰다.
     scrollHeight 는 내용 높이라, 한 번 auto 로 접었다 재야 줄어들 때도 따라온다 */
  useEffect(() => {
    const el = inputRef.current?.querySelector('textarea')
    if (!el) return
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 24
    el.style.height = 'auto'
    const need = Math.max(1, Math.round(el.scrollHeight / lh))
    const next = Math.min(MAX_INPUT_LINES, need)
    el.style.height = `${next * lh}px`
    el.style.overflowY = need > MAX_INPUT_LINES ? 'auto' : 'hidden'
    setLines(next)
  }, [query])

  /* 패널은 Esc 로도 닫는다 — 덮고 있는 화면에서 나가는 길이 X 하나뿐이면 갇힌다 */
  useEffect(() => {
    if (!source) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSource(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [source])

  /* 대기가 길어지면 지연 안내 */
  useEffect(() => {
    setSlow(false)
    if (!pendingQuestion) return
    const t = setTimeout(() => setSlow(true), SLOW_HINT_MS)
    return () => clearTimeout(t)
  }, [pendingQuestion])

  /** 고친 질문으로 다시 보낸다. 그 턴부터 뒤는 걷는다 — 앞 답변을 두면 문맥이 어긋난다 */
  const resend = () => {
    const trimmed = draft.trim()
    if (trimmed.length === 0 || pending || !editing) return
    onEditResend?.(editing, trimmed)
    setEditing(null)
  }

  const submit = () => {
    const trimmed = query.trim()
    if (trimmed.length === 0 || pending) return
    stickBottomRef.current = true // 내가 보낸 질문은 항상 따라간다
    onAsk?.(trimmed)
    setQuery('')
  }

  return (
    /* 대화와 원문 패널이 나란히 선다. 패널이 없으면 대화가 폭을 다 쓴다 */
    <div className="chat-layout" data-source={source ? 'open' : undefined}>
      <div className="chat-page" data-empty={empty}>
      {/* ── 대화 스트림 — 이 영역 하나만 스크롤한다 ─────────────────────── */}
      <div className="chat-scroll" ref={streamRef} onScroll={handleStreamScroll}>
        <div className="chat-inner">
          {empty ? (
            <section className="chat-intro" aria-label="시작 안내">
              {/* 장식 전용 — 시스템이 살아 있다는 신호. 의미는 아래 문구가 진다 */}
              <div className="chat-orb" aria-hidden>
                <HeroCubes centered />
              </div>
              <h1 className="chat-intro-title">무엇을 찾아드릴까요?</h1>
              {/* 시스템이 무엇을 할 수 있는지 밝힌다 — HAX G1 */}
              <p className="chat-intro-desc">
                한국방사선진흥협회가 보유한 실태조사 통계표와 전문보고서에서
                <br />
                근거를 찾아 출처와 함께 답변합니다.
              </p>
            </section>
          ) : (
            /* role="log" — 새 메시지를 순서대로 읽어준다. 접근 가능한 이름 필수 */
            <section className="chat-stream" role="log" aria-labelledby="chat-stream-title">
              <h2 id="chat-stream-title" className="visually-hidden">
                대화 내용
              </h2>

              {messages.map((m, i) => (
                <div key={m.id} className="chat-turn">
                  {/* 질문 수정 후 다시 전송 (기획 §6.1) — 오타 하나에 같은 문장을 다시 치지 않게 */}
                  {editing === m.id ? (
                    <div className="chat-question-edit">
                      <Textarea
                        label="질문 수정"
                        value={draft}
                        onChange={setDraft}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                            e.preventDefault()
                            resend()
                          }
                          if (e.key === 'Escape') setEditing(null)
                        }}
                      />
                      <div className="chat-question-edit-steps">
                        <Button variant="text" size="small" onClick={() => setEditing(null)}>
                          취소
                        </Button>
                        <Button
                          variant="primary"
                          size="small"
                          disabled={draft.trim().length === 0 || pending}
                          onClick={resend}
                        >
                          다시 보내기
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="chat-question-row">
                      <div className="chat-question">
                        <span className="visually-hidden">질문:</span>
                        {m.question}
                      </div>
                      <Button
                        variant="text"
                        size="small"
                        className="chat-action chat-question-edit-open"
                        onClick={() => {
                          setEditing(m.id)
                          setDraft(m.question)
                        }}
                      >
                        <Pencil size={14} aria-hidden />
                        수정
                      </Button>
                    </div>
                  )}
                  <Answer
                    message={m}
                    isLast={i === messages.length - 1 && !pending}
                    onAsk={onAsk}
                    onFeedback={onFeedback}
                    onRegenerate={onRegenerate}
                    onOpenSource={openSource}
                  />
                </div>
              ))}

              {pendingQuestion && (
                <div className="chat-turn">
                  <div className="chat-question">
                    <span className="visually-hidden">질문:</span>
                    {pendingQuestion}
                  </div>
                  <div className="chat-answer">
                    {/* 상태는 색·애니메이션만이 아니라 텍스트로도 전달한다 (AC-110).
                        보조기술에는 이 한 줄만 알린다 — 흘러드는 토큰을 매번 읽으면 못 쓰는 화면이 된다 */}
                    <p className="chat-generating" aria-live="polite">
                      <span className="chat-dot" aria-hidden />
                      답변 생성 중…
                    </p>

                    {pendingAnswer ? (
                      /* 스트리밍 본문 — 시각 표시 전용. 완료 시 확정본이 로그에 들어가며 한 번에 읽힌다 */
                      <div className="chat-answer-body chat-streaming" aria-hidden>
                        {pendingAnswer.split('\n\n').map((para, i, all) => (
                          <p key={i}>
                            {para}
                            {i === all.length - 1 && <span className="chat-caret" />}
                          </p>
                        ))}
                      </div>
                    ) : (
                      /* 첫 글자 전 — 답변 골격을 미리 보여준다 */
                      <div className="chat-skeleton" aria-hidden>
                        <span />
                        <span />
                        <span />
                      </div>
                    )}

                    {slow && (
                      <p className="chat-generating-slow">
                        답변 작성에 시간이 조금 더 걸리고 있어요. 잠시만 기다려 주세요.
                      </p>
                    )}

                  </div>
                </div>
              )}
            </section>
          )}
        </div>

      </div>

      {/* ── 입력 영역 — 하단 도킹. 스트림과 같은 폭을 공유한다 ──────────── */}
      <div className="chat-dock">
        {/* 오류·제한 (기획 §10.3) — 화면을 갈아 끼우지 않고 입력창 바로 위에 띠로 얹는다.
            대화도 입력한 질문도 그대로 남는다 */}
        {problem && (
          <div className="chat-inner">
            <Alert tone={PROBLEM_TEXT[problem.kind].tone} title={PROBLEM_TEXT[problem.kind].title}>
              {PROBLEM_TEXT[problem.kind].desc}
              {problem.onRetry && PROBLEM_TEXT[problem.kind].retry && (
                <div className="chat-problem-step">
                  <Button variant="secondary" size="small" onClick={problem.onRetry}>
                    {PROBLEM_TEXT[problem.kind].retry}
                  </Button>
                </div>
              )}
            </Alert>
          </div>
        )}
        {/* 위를 읽는 중에 답변이 오면 입력창 바로 위에 뜬다 (ChatGPT 와 같은 자리) */}
        {hasNew && (
          <Button variant="secondary" size="small" className="chat-jump" onClick={scrollToBottom}>
            새 답변 <ChevronDown size={14} aria-hidden />
          </Button>
        )}
        <div className="chat-inner">
          {/* ★ 캡슐 전체가 입력 영역이다 — 여백을 눌러도 커서가 입력칸에 들어온다.
              보이는 상자와 실제로 글자를 받는 자리가 다르면, 가장자리를 눌렀을 때
              아무 일도 일어나지 않아 「눌러도 안 되는 칸」으로 읽힌다.
              버튼·칩 같은 제 조작이 있는 자리는 그대로 둔다 */}
          <div className="chat-composer-shell">
          {/* 빛은 **형제**로 뺀다. 컴포저의 자식(::before, z-index -1)으로 두면
              쌓임 맥락 안에서 부모 배경 **위에** 칠해져 캡슐 안쪽까지 물든다 */}
          <span className="chat-composer-glow" aria-hidden />
          <div
            className="chat-composer"
            data-lines={lines}
            onMouseDown={(e) => {
              const el = e.target as HTMLElement
              if (el.closest('button, a, input, textarea, select, label')) return
              e.preventDefault()
              inputRef.current?.querySelector('textarea')?.focus()
            }}
          >

            {/* 입력칸과 전송을 **한 줄**로 묶는다 — 한 줄일 때 캡슐이 되려면 둘이 같은 줄에 서야 한다.
                라벨은 화면에서 감추되 보조기술에는 남긴다 */}
            <div className="chat-composer-main">
            <div className="chat-composer-input" ref={inputRef}>
              <Textarea
                label="질문"
                /* 킷 기본은 rows=2 라 빈 칸에서도 두 줄로 시작한다 — 캡슐이 되려면 한 줄이어야 한다.
                   실제 높이는 위 auto-grow 가 줄 수를 재서 넣는다 */
                rows={1}
                placeholder="궁금한 내용을 입력하세요"
                value={query}
                onChange={setQuery}
                onKeyDown={(e) => {
                  // Enter 전송 · Shift+Enter 줄바꿈. 한글 조합 중 Enter 는 전송으로 치지 않는다
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    submit()
                  }
                }}
              />
            </div>

            <div className="chat-composer-send">
              {/* 글자 수는 한계에 가까울 때만 알린다 — 상시 노출은 자리만 먹는다 (AC-025) */}
              {query.length > QUERY_MAX * 0.8 && (
                <span className="chat-count" data-over={query.length > QUERY_MAX} aria-live="polite">
                  {query.length.toLocaleString()} / {QUERY_MAX.toLocaleString()}자
                </span>
              )}
              {/* 보내기는 원형 아이콘 버튼이다. 캡슐 안에서 글자 버튼은 알맹이보다 커지고,
                  이 자리의 뜻(「보낸다」)은 화살표 하나로 충분하다.

                  ★ 생성 중에는 **같은 버튼이 정지가 된다.** 보내기와 멈추기는 서로를 대신하는
                    한 자리다 — 보내는 동안에는 보낼 수 없고, 멈추면 다시 보낼 수 있다.
                    답변 안에 중단 버튼을 따로 두면 스트림을 따라 내려가며 그걸 쫓아야 하는데,
                    컴포저는 늘 같은 자리에 있다.
                  ★ 아이콘만 있으므로 이름을 반드시 준다 (기획 §11 「아이콘 버튼에 접근 가능한
                    이름 제공」). 모양만으로는 상태를 못 읽는다 */}
              {pending && onStop ? (
                <IconButton
                  size="lg"
                  shape="circle"
                  filled
                  aria-label="답변 생성 중단"
                  onClick={onStop}
                >
                  {/* 채운 네모 — 멈춤의 관습 표식 */}
                  <Square aria-hidden fill="currentColor" strokeWidth={0} />
                </IconButton>
              ) : (
                <IconButton
                  size="lg"
                  shape="circle"
                  filled
                  aria-label="질문 보내기"
                  disabled={query.trim().length === 0 || query.length > QUERY_MAX || pending}
                  onClick={submit}
                >
                  <ArrowUp aria-hidden />
                </IconButton>
              )}
            </div>
            </div>
          </div>
          </div>

          {/* 추천 질문 — 입력창 **아래**. 무엇을 물어야 할지 모를 때 눈이 가는 자리가
              입력창이고, 그 바로 밑이 다음으로 읽히는 줄이다 (기획 §5.3) */}
          {empty && (
            <SuggestionList label="이렇게 물어보세요" items={SUGGESTED_QUESTIONS} onPick={onAsk} />
          )}
        </div>
      </div>
      </div>

      <SourcePanel
        evidence={source}
        status={sourceStatus}
        page={sourcePage}
        pageCount={sourcePage ? sourcePage + 2 : undefined}
        zoom={sourceZoom}
        onPageChange={setSourcePage}
        onZoomChange={setSourceZoom}
        onRetry={() => {
          setSourceStatus('loading')
          setTimeout(() => setSourceStatus('ready'), 600)
        }}
        onClose={() => setSource(null)}
      />
    </div>
  )
}
