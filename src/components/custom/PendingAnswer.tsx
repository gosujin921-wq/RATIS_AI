import './PendingAnswer.css'

/**
 * 답변 생성 중인 턴 — 방금 보낸 질문과 그 아래 대기 표시.
 *
 * ★ 상태를 **글자로도** 전한다 (AC-110). 점 애니메이션만 두면 눈으로 보는 사람에게만
 *   전해진다. 보조기술에는 이 한 줄만 알린다 — 흘러드는 토큰을 매번 읽으면 못 쓰는
 *   화면이 된다.
 * ★ 부분 답변이 있어도 **근거·유형 표시는 그리지 않는다.** 둘은 응답이 끝나야 확정되는데,
 *   내부 근거인 줄 알고 읽었다가 끝나서 외부 응답이면 불변식이 깨진다 (AC-026).
 */
export function PendingAnswer({
  question,
  partial,
  slow,
}: {
  question: string
  /** 스트리밍으로 지금까지 도착한 본문. 없으면 골격(스켈레톤)만 보여 준다 */
  partial?: string | null
  /** 대기가 길어졌는가 — 기다리면 되는 상황임을 한 줄 더 말한다 */
  slow?: boolean
}) {
  return (
    <div className="chat-turn">
      <div className="chat-question">
        <span className="visually-hidden">질문:</span>
        {question}
      </div>
      <div className="chat-answer">
        <p className="chat-generating" aria-live="polite">
          <span className="chat-dot" aria-hidden />
          답변 생성 중…
        </p>

        {partial ? (
          /* 스트리밍 본문 — 시각 표시 전용. 완료 시 확정본이 로그에 들어가며 한 번에 읽힌다 */
          <div className="chat-answer-body chat-streaming" aria-hidden>
            {partial.split('\n\n').map((para, i, all) => (
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
  )
}
