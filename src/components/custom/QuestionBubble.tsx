import { CopyButton } from './CopyButton'
import './QuestionBubble.css'

/**
 * 사용자 질문 한 줄 — 오른쪽 말풍선.
 *
 * ★ 액션(복사)은 **말풍선 왼쪽에 숨어 있다가 마우스·초점이 닿을 때** 나온다.
 *   답변 쪽과 달리 상시로 두지 않는다: 질문은 사용자가 쓴 문장이라 되읽을 일이 드물고,
 *   턴마다 아이콘이 서면 대화가 조작으로 뒤덮인다.
 * ★ **보낸 질문은 고치지 않는다** (2026-09-04). 고쳐 다시 보내면 그 턴부터 뒤가 걷혀
 *   이미 읽은 답변이 사라진다. 다르게 묻고 싶으면 아래 입력창에서 새로 묻는다 —
 *   대화는 지워지지 않고 이어 쌓인다.
 */
export function QuestionBubble({ question }: { question: string }) {
  return (
    <div className="chat-question-row">
      <div className="chat-question">
        {/* 스크린리더가 화자를 알 수 있게 — 위치로만 구분하면 WCAG 1.3.1 위반 */}
        <span className="visually-hidden">질문:</span>
        {question}
      </div>
      <div className="chat-question-actions">
        <CopyButton text={question} label="질문 복사" />
      </div>
    </div>
  )
}
