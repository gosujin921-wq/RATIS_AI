import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { CopyButton } from './CopyButton'
import { IconButton } from './IconButton'
import './QuestionBubble.css'

/**
 * 사용자 질문 한 줄 — 오른쪽 말풍선. 고쳐서 다시 보낼 수 있다 (기획 §6.1).
 *
 * ★ 액션(복사·수정)은 **말풍선 왼쪽에 숨어 있다가 마우스·초점이 닿을 때** 나온다.
 *   답변 쪽과 달리 상시로 두지 않는다: 질문은 사용자가 쓴 문장이라 되읽을 일이 드물고,
 *   턴마다 아이콘이 서면 대화가 조작으로 뒤덮인다.
 * ★ 고치는 동안에는 말풍선이 **입력칸으로 바뀐다.** 옆에 따로 칸을 열면 원문과 고친 글이
 *   나란히 서서 어느 쪽이 보내질 것인지 흐려진다.
 * ★ 수정 상태는 이 부품이 갖는다 — 어느 턴을 고치는 중인지는 그 턴의 사정이다.
 *   보내는 일만 위로 올린다.
 */
export function QuestionBubble({
  question,
  disabled,
  onResend,
}: {
  question: string
  /** 답변을 기다리는 중이면 다시 보낼 수 없다 */
  disabled?: boolean
  /** 고친 질문으로 다시 보낸다. 넘기지 않으면 수정 단추가 서지 않는다 */
  onResend?: (next: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(question)

  const send = () => {
    const trimmed = draft.trim()
    if (trimmed.length === 0 || disabled) return
    onResend?.(trimmed)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="chat-question-edit">
        <Textarea
          label="질문 수정"
          value={draft}
          onChange={setDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              send()
            }
            if (e.key === 'Escape') setEditing(false)
          }}
        />
        <div className="chat-question-edit-steps">
          <Button variant="text" size="small" onClick={() => setEditing(false)}>
            취소
          </Button>
          <Button
            variant="primary"
            size="small"
            disabled={draft.trim().length === 0 || disabled}
            onClick={send}
          >
            다시 보내기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-question-row">
      <div className="chat-question">
        {/* 스크린리더가 화자를 알 수 있게 — 위치로만 구분하면 WCAG 1.3.1 위반 */}
        <span className="visually-hidden">질문:</span>
        {question}
      </div>
      <div className="chat-question-actions">
        <CopyButton text={question} label="질문 복사" />
        {onResend && (
          <IconButton
            size="sm"
            className="chat-action"
            aria-label="질문 수정"
            title="질문 수정"
            onClick={() => {
              setDraft(question)
              setEditing(true)
            }}
          >
            <Pencil aria-hidden />
          </IconButton>
        )}
      </div>
    </div>
  )
}
