import { Download, FileText, Table2 } from 'lucide-react'
import type { Evidence } from '../../api/types'
import { Button } from '../ui/Button'
import './EvidenceCard.css'

/**
 * 근거 카드 — 답변이 인용한 원문 한 토막.
 *
 * 2026-09-14 부터 **오른쪽 패널(SourcePanel 의 목록 모드)에 선다.** 종전에는 답변 아래
 * 접이식 안에 있었는데, 협회 의견이 「근거를 우측 화면에 바로 띄워 달라」였다.
 * 답변 쪽에는 인용 칩(EvidenceList)만 남고, 카드는 여기서 그린다.
 *
 * 출처 계층 — 카테고리 › 구역·표 › 쪽 (법률구조공단 브레드크럼 방식).
 * ★ 캡션(단위·주·출처) 생략 금지 — 빠지면 수치가 맞아도 오독된다 (NFR-008).
 * 보는 걸음과 받는 걸음이 **한 줄에 나란히** 선다 — 확인만 할 사람은 원문 화면으로,
 * 자료로 쓸 사람은 파일로.
 */
export function EvidenceCard({
  evidence,
  index,
  onOpenSource,
  onDownload,
}: {
  evidence: Evidence
  /** 목록 안 순번 (1부터). 답변 쪽 인용 칩과 같은 번호라 둘을 맞춰 읽는다 */
  index?: number
  onOpenSource?: (e: Evidence) => void
  onDownload?: (e: Evidence) => void
}) {
  const Icon = evidence.blockType === 'table' ? Table2 : FileText
  return (
    <article className="chat-evidence-card">
      <p className="chat-evidence-path">
        {index !== undefined && <span className="chat-evidence-index">{index}</span>}
        <span>{evidence.categoryName}</span>
        {(evidence.tableTitle ?? evidence.sectionName) && (
          <span>{evidence.tableTitle ?? evidence.sectionName}</span>
        )}
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
      {evidence.caption && <p className="chat-evidence-caption">{evidence.caption}</p>}
      <div className="chat-evidence-steps">
        <Button variant="secondary" size="small" onClick={() => onOpenSource?.(evidence)}>
          원문 보기
        </Button>
        {onDownload && evidence.fileUrl && (
          <Button variant="tertiary" size="small" onClick={() => onDownload(evidence)}>
            <Download size={14} aria-hidden />
            다운로드
          </Button>
        )}
      </div>
    </article>
  )
}
