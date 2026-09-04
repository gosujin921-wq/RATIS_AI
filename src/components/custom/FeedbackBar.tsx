import { useEffect, useState } from 'react'
import { Check, Frown, Info, Smile, X } from 'lucide-react'
import type { Feedback, FeedbackReason } from '../../api/types'
import { FEEDBACK_REASONS } from '../../api/types'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { IconButton } from './IconButton'
import './FeedbackBar.css'

/**
 * 답변 피드백 (기획 §9).
 *
 *   도움이 됐어요            → 바로 끝
 *   도움이 안 됐어요 → 사유   → 고르고 「제출」로 확정
 *
 * ★ **부정 피드백은 고르는 것으로 끝나지 않는다** (2026-09-04). 사유를 누르는 즉시
 *   보내면 잘못 누른 것을 되돌릴 수 없다. 누르는 것은 고르는 데까지고, 확정은 「제출」이
 *   맡는다. 「취소」로 물음 앞자리까지 돌아간다.
 * ★ 사유는 **하나만** 선다. 다시 누르면 풀리고, 다른 것을 누르면 그리로 옮겨 간다.
 *   여러 개를 받으면 통계에서 한 건이 여러 사유로 세어져 무엇이 문제였는지 흐려진다.
 * ★ 「도움이 됐어요」는 확인 단계 없이 그대로 보낸다. 되돌릴 것이 없는 한 번의 뜻이라,
 *   여기까지 두 걸음으로 만들면 대부분 지나친다.
 * ★ 보내기 전에 **어디에 쓰이는지 알린다.** 질문과 답변이 함께 넘어가는 일이라 고지 없이
 *   거둘 수 없다. 링크 없이 문구만 둔다.
 * ★ 「오류 신고」를 두지 않는다. 신고를 눌러도 열리는 것이 부정 피드백과 같은 사유 목록이라,
 *   사용자가 평가인지 신고인지 스스로 갈라야 할 이유가 없었다. 화면·기능 오류는 사유
 *   목록에 그대로 남아 있다.
 *
 * 저장·관리자 연계는 개발 영역이라 여기서는 onSubmit 으로 넘기고 끝난다.
 */
/** 완료 문구가 머무는 시간. 한 줄을 읽고도 남을 만큼만 둔다 */
const DONE_HOLD_MS = 4000
/** 사라지는 데 걸리는 시간. CSS 의 `[data-leaving]` 애니메이션과 같은 값이어야 한다 */
const LEAVE_MS = 260
/** 제출 전 고지. 질문·답변이 함께 넘어간다는 사실을 이 자리에서 알린다 */
const CONSENT_NOTICE = '제출하신 의견과 해당 질문·답변은 향후 답변 품질 개선에 사용됩니다.'

export function FeedbackBar({ id, onSubmit }: { id: string; onSubmit?: (f: Feedback) => void }) {
  /** 사유를 묻는 중인가 (「도움이 안 됐어요」를 누른 뒤) */
  const [asking, setAsking] = useState(false)
  /** 고른 사유. 하나뿐이고, 고르지 않았으면 null */
  const [reason, setReason] = useState<FeedbackReason | null>(null)
  const [comment, setComment] = useState('')
  const [done, setDone] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  /** 사라지는 중. 이 동안 상자가 옅어지며 접힌다 */
  const [leaving, setLeaving] = useState(false)

  /* 고맙다는 말은 **잠깐만 선다** (2026-09-03). 답변마다 서는 자리라, 보낸 뒤에도 남아
     있으면 대화가 완료 문구로 채워진다. 읽을 시간은 주되 자리는 돌려준다.
     ★ **툭 사라지지 않는다.** 먼저 옅어지며 접히고(LEAVE_MS) 그다음에 걷는다 — 자리가
       갑자기 없어지면 아래에 있던 것이 위로 튀어 방금 읽던 줄을 잃는다.
     ★ 정리(clearTimeout)를 반드시 한다 — 대화를 옮기거나 다시 물으면 이 부품이 사라지는데,
       남은 타이머가 사라진 부품의 상태를 건드리면 경고가 뜬다 */
  useEffect(() => {
    if (!done) return
    const hold = setTimeout(() => setLeaving(true), DONE_HOLD_MS)
    const gone = setTimeout(() => setDismissed(true), DONE_HOLD_MS + LEAVE_MS)
    return () => {
      clearTimeout(hold)
      clearTimeout(gone)
    }
  }, [done])

  /* 닫은 답변에는 다시 묻지 않는다 — 매 답변마다 되살아나면 물음이 아니라 방해가 된다 */
  if (dismissed) return null

  const finish = (f: Feedback) => {
    onSubmit?.(f)
    setDone(true)
  }

  /* 물음 앞자리로 되돌린다. 고른 것과 적은 것을 함께 지운다 — 남겨 두면 다시 열었을 때
     지난번 선택이 이미 켜져 있어 「내가 골랐던가」가 생긴다 */
  const cancel = () => {
    setAsking(false)
    setReason(null)
    setComment('')
  }

  const writing = reason === '기타'
  const canSubmit = reason !== null && (!writing || comment.trim().length > 0)

  const submit = () => {
    if (!canSubmit || reason === null) return
    finish({
      helpful: false,
      reasons: [reason],
      ...(writing ? { comment: comment.trim() } : {}),
    })
  }

  if (done) {
    return (
      <div className="chat-feedback-box" role="status" data-leaving={leaving || undefined}>
        <Check size={16} aria-hidden className="chat-feedback-done-icon" />
        <p className="chat-feedback-done">의견 고맙습니다. 답변을 개선하는 데 쓰겠습니다.</p>
      </div>
    )
  }

  const titleId = `${id}-feedback`
  const noticeId = `${id}-feedback-notice`

  return (
    <div className="chat-feedback-box" role="group" aria-labelledby={titleId}>
      <div className="chat-feedback-head">
        <p className="chat-feedback-title" id={titleId}>
          이 답변이 도움이 되었나요?
        </p>
        {/* 평가하지 않고 닫는 길. 아이콘만이라 이름을 준다 (기획 §11) */}
        <IconButton size="sm" aria-label="피드백 닫기" onClick={() => setDismissed(true)}>
          <X aria-hidden />
        </IconButton>
      </div>

      {/* 1차 — 「됐어요」는 누르면 끝. 「안 됐어요」는 아래에 사유를 편다.
          ★ 편 뒤에도 이 줄은 **그대로 선다.** 감추면 무엇을 고른 상태인지 사라지고,
            잘못 눌렀을 때 되돌아갈 자리도 없어진다 */}
      <div className="chat-feedback-row">
          <button
            type="button"
            className="chat-feedback-pick"
            onClick={() => finish({ helpful: true })}
          >
            <Smile size={18} aria-hidden />
            도움이 됐어요
          </button>
          <button
            type="button"
            className="chat-feedback-pick"
            aria-pressed={asking}
            onClick={() => setAsking(true)}
          >
            <Frown size={18} aria-hidden />
            도움이 안 됐어요
          </button>
      </div>

      {/* 2차 — 사유. **누르면 골라질 뿐 보내지지 않는다.** 하나만 서고, 같은 것을 다시
          누르면 풀린다 */}
      {asking && (
        <div className="chat-feedback-row" role="group" aria-label="그렇게 생각한 이유">
          {FEEDBACK_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              className="chat-feedback-pick"
              aria-pressed={reason === r}
              onClick={() => setReason((prev) => (prev === r ? null : r))}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* 3차 — 「기타」에서만 열린다. 목록에 없는 사유를 적는 자리다 */}
      {asking && writing && (
        <div className="chat-feedback-form">
          <Textarea
            wrapClassName="small"
            label="어떤 점이 아쉬웠는지 알려주세요"
            rows={2}
            placeholder="사유를 적어 주세요"
            value={comment}
            onChange={setComment}
          />
        </div>
      )}

      {/* 4차 — 고지와 확정. 고지는 **버튼 바로 위**에 선다. 누르기 직전에 읽히지 않으면
          알린 것이 아니다 */}
      {asking && (
        <div className="chat-feedback-confirm">
          <p className="chat-feedback-notice" id={noticeId}>
            <Info size={16} aria-hidden className="chat-feedback-notice-icon" />
            {CONSENT_NOTICE}
          </p>
          <div className="chat-feedback-steps">
            <Button variant="text" size="small" onClick={cancel}>
              취소
            </Button>
            <Button
              variant="primary"
              size="small"
              disabled={!canSubmit}
              aria-describedby={noticeId}
              onClick={submit}
            >
              제출
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
