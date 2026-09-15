import { ChevronRight, FileText, Table2 } from 'lucide-react'
import type { Evidence } from '../../api/types'
import './EvidenceList.css'

/**
 * 답변 쪽 근거 줄 — 「근거 n건」 머리와 인용 칩.
 *
 * 2026-09-14 협회 의견 「근거를 우측 화면에 바로 띄워 달라」로 자리가 갈렸다:
 *   오른쪽 패널   근거 카드 전부 (EvidenceCard) — PC 에서는 답변이 오면 저절로 열린다
 *   여기(답변)    무엇을 인용했는지 **한 줄로** — 문서 이름과 쪽만 적은 칩
 *
 * 종전에는 여기가 접이식이었다. 접힌 채로는 근거가 있다는 사실만 보이고 무엇인지는
 * 눌러야 알았고, 펼치면 답변 하나가 화면 두 장이 됐다. 카드가 패널로 가니 답변은 짧고
 * 근거는 늘 옆에 있다.
 *
 * 칩을 누르면 그 근거의 **원문 화면**이 패널에 선다. 머리(근거 n건)를 누르면 목록 모드다 —
 * 좁은 화면에서는 패널이 저절로 열리지 않으므로 이 머리가 목록으로 가는 유일한 길이다.
 * 칩의 번호는 패널 카드의 순번과 같다.
 */
export function EvidenceList({
  evidences,
  id,
  onOpenSource,
  onOpenList,
}: {
  evidences: Evidence[]
  id: string
  /** 칩 하나 → 그 근거의 원문 */
  onOpenSource?: (e: Evidence) => void
  /** 머리 → 이 답변의 근거 목록 */
  onOpenList?: () => void
}) {
  const headId = `${id}-evidences`
  return (
    <div className="chat-evidences">
      <button
        type="button"
        className="chat-evidences-head"
        id={headId}
        onClick={onOpenList}
        aria-label={`근거 ${evidences.length}건 목록 열기`}
      >
        근거 {evidences.length}건
        <ChevronRight size={14} aria-hidden />
      </button>
      <ul className="chat-evidences-chips" aria-labelledby={headId}>
        {evidences.map((e, i) => {
          const Icon = e.blockType === 'table' ? Table2 : FileText
          return (
            <li key={e.chunkId}>
              <button
                type="button"
                className="chat-evidence-chip"
                onClick={() => onOpenSource?.(e)}
                title={e.documentTitle}
              >
                <span className="chat-evidence-chip-index">{i + 1}</span>
                <Icon size={14} aria-hidden />
                <span className="chat-evidence-chip-title">{e.documentTitle}</span>
                {e.pageNo !== null && <span className="chat-evidence-chip-page">{e.pageNo}쪽</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
