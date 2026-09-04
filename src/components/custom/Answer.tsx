import { CircleX, FileText, Info } from 'lucide-react'
import type { ChatMessage, Evidence, Feedback } from '../../api/types'
import { AnswerBody } from './AnswerBody'
import { CopyButton } from './CopyButton'
import { EvidenceList } from './EvidenceList'
import { FeedbackBar } from './FeedbackBar'
import './Answer.css'

/** AI 답변 한 건 */
export function Answer({
  message,
  onFeedback,
  onOpenSource,
  onDownloadEvidence,
}: {
  message: ChatMessage
  onFeedback?: (f: Feedback) => void
  onOpenSource?: (e: Evidence) => void
  onDownloadEvidence?: (e: Evidence) => void
}) {
  return (
    <div className="chat-answer">
      {/* 스크린리더가 화자를 알 수 있게 — 위치로만 구분하면 WCAG 1.3.1·1.3.3 위반 */}
      <span className="visually-hidden">RATIS AI 답변:</span>

      {/* 답변 안내 — 차단이든 아니든 **면·선 없이 한 줄**로 선다. 이 줄이 서면 위 배지가
          접히므로, 여기 적힌 문구가 근거 유형을 말하는 **유일한 자리**다 (AC-085).
          박스를 두르지 않는 것은 답변 본문보다 무거워지지 않기 위해서다.
          차단만 성격이 갈린다: 글리프는 ✕, 색은 danger — 배지(차단됨)와 짝이 맞아야
          "못 받았다"가 색·모양 둘로 읽힌다 (색만으로 구분하지 않는다, WCAG 1.4.1).
          live 도 갈린다 — 차단은 요청이 거절된 결과라 즉시 읽어 주고(alert), 나머지는
          응답과 함께 확정되는 안내라 하던 말 끝나고 읽는다(status) */}
      {message.notice &&
        (() => {
          const blocked = message.evidenceType === 'BLOCKED'
          return (
            <p
              className="chat-notice"
              data-tone={blocked ? 'danger' : 'info'}
              role={blocked ? 'alert' : 'status'}
            >
              {blocked ? <CircleX size={14} aria-hidden /> : <Info size={14} aria-hidden />}
              {message.notice}
            </p>
          )
        })()}

      {/* 범위를 좁혀 못 찾음 (AC-034) — **차단 안내와 같은 줄 모양**이다. 성격은 색이 진다.
          면을 두른 상자로 세우면 같은 갈래의 안내인데 하나는 상자, 하나는 줄이 되어
          둘 중 어느 쪽이 더 무거운 말인지 모양이 거짓말을 한다.
          warning-60(#b45309)은 흰 바탕에서 5.02:1 로 본문 대비 기준(4.5)을 넘는다 —
          한 단 밝은 50(#d97706)은 3.02:1 이라 본문 색으로 못 쓴다 */}
      {message.scopeNarrowed && (
        <p className="chat-notice" data-tone="warning" role="status">
          <Info size={14} aria-hidden />
          선택한 검색 범위에서 근거를 찾지 못했습니다. 범위를 넓혀 다시 시도해 보세요.
        </p>
      )}

      {/* 제목·목록·표·인용까지 그린다 (기획 §7) */}
      {message.answer && <AnswerBody className="chat-answer-body" text={message.answer} />}

      {message.evidences.length > 0 && (
        <EvidenceList
          evidences={message.evidences}
          id={message.id}
          onOpenSource={onOpenSource}
          onDownload={onDownloadEvidence}
        />
      )}

      {/* 보고서 — 답변을 정리해 받는 자리 (2026-09-03 추가).
          ⚠ 파일로 내려받을지 링크로 열지는 미확정이라 **지금은 링크 한 줄**이다.
            방식이 정해지면 이 줄의 모양을 다시 잡는다 */}
      {message.report && (
        <a
          className="chat-report"
          href={message.report.url}
          target="_blank"
          rel="noreferrer"
        >
          <FileText size={15} aria-hidden />
          {message.report.title}
        </a>
      )}

      {/* 답변별 고지 — 국내 공공 관행(정부24·법률구조공단)을 따른다 */}
      {message.evidenceType !== 'BLOCKED' && (
        <p className="chat-disclaimer">
          <Info size={14} aria-hidden />
          AI가 생성한 답변으로 실제와 다를 수 있습니다. 수치는 근거 원문에서 확인하세요.
        </p>
      )}

      {/* ★ 「다시 생성」을 두지 않는다 (2026-09-03). 같은 답을 한 번 더 받는 걸음은
          이미 읽은 답변을 밀어내면서 무엇이 달라졌는지는 남기지 않는다. 다시 묻고 싶으면
          아래 입력창에서 새로 묻는다 — 대화가 지워지지 않고 이어 쌓인다.
          남은 액션은 복사 하나다 */}
      {message.answer && (
        <div className="chat-actions">
          <CopyButton text={message.answer} />
        </div>
      )}

      {/* 피드백 — **답변마다** 묻는다 (2026-09-03).
          마지막 답변에만 두면 이어 물은 대화에서 앞 답변은 평가할 길이 없어, 대화당
          한 건만 쌓인다. 피드백은 질문 단위로 모아 통계로 쓰는 값이라 답변마다 자리가
          있어야 한다. 답한 뒤에는 완료 문구로 접히고, 닫으면 그 답변에는 다시 묻지 않는다.
          차단된 답변에는 묻지 않는다 — 평가할 답변이 없다 */}
      {message.evidenceType !== 'BLOCKED' && (
        <FeedbackBar id={message.id} onSubmit={onFeedback} />
      )}
    </div>
  )
}
