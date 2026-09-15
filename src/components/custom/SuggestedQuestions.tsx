import { Sparkles } from 'lucide-react'
import './SuggestedQuestions.css'

/**
 * 추천 질문 — 시작 화면 입력창 아래에 서는 예시 질문 줄 (2026-09-14 협회 의견 반영).
 *
 * 처음 온 사람이 「무엇을 물어도 되는지」를 문구가 아니라 **실제 질문 모양**으로 본다.
 * 누르면 그 질문이 **바로 전송된다** — 입력칸에 채워 넣고 한 번 더 누르게 하면 걸음이
 * 하나 늘 뿐 고칠 일이 없다. 다르게 묻고 싶은 사람은 애초에 칩을 안 누른다.
 *
 * ★ 모양은 칩이지만 **고르는 칩(ChipGroup)이 아니다.** ChipGroup 은 조건을 켜고 끄는
 *   라디오·체크박스이고, 이건 누르면 일이 일어나는 **명령**이다 — 그래서 `button` 이다.
 *   캡슐인 까닭도 같다: 명령은 캡슐, 내용 상자는 각지게 (design.md §7).
 * ★ 시작 화면에만 선다. 답변이 붙은 뒤의 후속 추천 질문은 제공하지 않는다 (기획 §5.4).
 * ★ 질문 목록은 화면이 들고 있지 않다. 실연동에서 어디서 오는지는 개발 협의 항목이다
 *   (기획 §14) — 지금은 데모 데이터에서 온다.
 */
export function SuggestedQuestions({
  questions,
  onPick,
  disabled,
}: {
  questions: readonly string[]
  onPick: (question: string) => void
  /** 답변을 기다리는 동안은 못 누른다 — 보내기 단추와 같은 규칙 */
  disabled?: boolean
}) {
  if (questions.length === 0) return null
  return (
    <nav className="chat-suggest" aria-label="추천 질문">
      <ul className="chat-suggest-list">
        {questions.map((q) => (
          <li key={q}>
            <button
              type="button"
              className="chat-suggest-chip"
              disabled={disabled}
              onClick={() => onPick(q)}
            >
              <Sparkles size={14} aria-hidden />
              {q}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
