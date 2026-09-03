import { useState } from 'react'
import { Download, FileText, Table2 } from 'lucide-react'
import type { Evidence } from '../../api/types'
import { Button } from '../ui/Button'
import { Disclosure } from '../ui/Disclosure'
import './EvidenceList.css'

function EvidenceCard({
  evidence,
  onOpenSource,
  onDownload,
}: {
  evidence: Evidence
  onOpenSource?: (e: Evidence) => void
  onDownload?: (e: Evidence) => void
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
      {/* 보는 걸음과 받는 걸음이 **한 줄에 나란히** 선다 (2026-09-03).
          종전에는 받기가 묶음 줄에 있었는데, 근거가 여럿일 때 어느 문서를 받는 것인지
          그 자리에서 알 수 없었다. 카드마다 두면 무엇을 받는지 카드가 말한다.
          확인만 할 사람은 패널로(페이지를 벗어나지 않는다 · 기획 §5.5), 자료로 쓸 사람은 파일로 */}
      <div className="chat-evidence-steps">
        <Button variant="tertiary" size="small" onClick={() => onOpenSource?.(evidence)}>
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

/** 답변 소속 근거 — 접이식. 대화가 쌓여도 각 답변이 자기 근거를 들고 있다 */
export function EvidenceList({
  evidences,
  id,
  onOpenSource,
  onDownload,
}: {
  evidences: Evidence[]
  id: string
  onOpenSource?: (e: Evidence) => void
  /** 근거 하나의 원문 파일을 받는다. 단추는 그 카드 안에 선다 */
  onDownload?: (e: Evidence) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    /* aria-expanded·aria-controls·패널 id 를 손으로 잇지 않는다 — Disclosure 가 진다 */
    <Disclosure
      className="chat-evidences"
      id={id}
      buttonText={`근거 ${evidences.length}건`}
      expanded={open}
      onToggle={setOpen}
    >
      <div className="chat-evidences-list">
        {evidences.map((e) => (
          <EvidenceCard
            key={e.chunkId}
            evidence={e}
            onOpenSource={onOpenSource}
            onDownload={onDownload}
          />
        ))}
      </div>
    </Disclosure>
  )
}
