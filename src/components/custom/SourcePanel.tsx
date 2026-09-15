import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { useState } from 'react'
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, Download, FileX, Maximize2, Minimize2, X } from 'lucide-react'
import type { Evidence } from '../../api/types'
import { EvidenceCard } from './EvidenceCard'
import './SourcePanel.css'

/**
 * 근거 패널 — 근거 **목록**과 출처 **원문** 두 모드를 가진 오른쪽 패널 (기획 §5.5 · §12.1).
 *
 * ★ 2026-09-14 협회 의견 「근거를 우측 화면에 바로 띄워 달라」.
 *   종전에는 답변 아래 접이식에서 「원문 보기」를 눌러야 이 패널이 섰다. 이제 답변이 오면
 *   PC 에서는 **근거 목록이 저절로** 이 자리에 선다 (view='list'). 목록의 「원문 보기」가
 *   같은 패널을 원문 화면(view='page')으로 바꾸고, 머리의 되돌아가기가 목록으로 돌린다.
 *   패널 하나가 두 모드를 갖는 까닭 — 목록과 원문이 다른 창이면 근거를 훑다 원문을 열 때
 *   화면이 바뀌고, 돌아오면 어디까지 봤는지 잃는다.
 *
 * ★ **페이지를 벗어나지 않는다.** 기획이 못박은 조건이다 — 근거를 확인하려고 대화를 떠나면
 *   돌아왔을 때 어디를 읽고 있었는지 잃는다. 그래서 창(modal)이 아니라 **옆에 서는 패널**이다.
 *   창으로 만들면 뒤 대화가 가려져 답변과 근거를 나란히 못 읽는다.
 *
 * 폭에 따라 서는 방식이 갈린다 (기획 §5.5, 실제 분기는 SourcePanel.css):
 *   PC(1024~)     대화 오른쪽에 붙는 분할 뷰 — 답변과 원문을 나란히 본다
 *   태블릿(768~)  오버레이 패널 — 대화 위에 덮되 좌측이 비쳐 맥락이 남는다
 *   모바일(~767)  전체 화면
 *
 * 실제 문서 뷰어(PDF) 연결은 개발 영역이다 (기획 명시). 여기서는 뷰어가 앉을 자리와
 * **그 자리가 가질 수 있는 모든 상태**를 잡는다 — 상태를 나중에 붙이면 레이아웃이 흔들린다.
 */
export type SourceStatus = 'loading' | 'ready' | 'unavailable' | 'gone'

export type SourceView = 'list' | 'page'

export function SourcePanel({
  view = 'page',
  evidences = [],
  onSelect,
  onBack,
  evidence,
  status = 'ready',
  page,
  pageCount,
  pageText,
  onPageChange,
  onDownload,
  onRetry,
  onClose,
}: {
  /**
   * list — 이 답변의 근거 카드 전부 (evidences) · page — 근거 하나의 원문 (evidence).
   * 목록 모드는 evidences 가 비어도 선다(「근거 없음」을 말한다).
   */
  view?: SourceView
  evidences?: Evidence[]
  /** 목록에서 카드의 「원문 보기」 → 원문 모드로 */
  onSelect?: (e: Evidence) => void
  /** 원문 모드에서 목록으로. 넘기지 않으면 되돌아가기가 서지 않는다 (목록 없이 바로 연 경우) */
  onBack?: () => void
  /** 원문 모드의 근거. null 이면 원문 모드는 서지 않는다 */
  evidence: Evidence | null
  status?: SourceStatus
  /** 지금 보고 있는 쪽. 없으면 근거의 pageNo 를 쓴다 */
  page?: number | null
  pageCount?: number
  /**
   * 지금 쪽의 **원문 글자**. 있으면 인용 구절 대신 이것을 지면에 그린다.
   * 실제 뷰어(PDF)가 붙기 전의 자리다 — 데모에서는 원본 PDF 에서 뽑은 글자가 들어온다.
   */
  pageText?: string
  onPageChange?: (next: number) => void
  /** 원문 파일을 통째로 받는다. 넘기지 않거나 파일 자리가 비면 단추가 서지 않는다 */
  onDownload?: (evidence: Evidence) => void
  onRetry?: () => void
  onClose?: () => void
}) {
  /** 창으로 크게 열었는가. **같은 패널**이 자리만 옮겨 앉는다 — 넓게 볼 때 다른 화면이
      되어 버리면 쪽 위치도 조작도 다시 익혀야 한다 */
  const [expanded, setExpanded] = useState(false)

  /* ── 목록 모드 ────────────────────────────────────────────────────────── */
  if (view === 'list') {
    return (
      <aside className="src-panel" aria-label="근거 목록" data-view="list">
        <header className="src-head">
          <div className="src-head-text">
            <p className="src-path">
              <span>이 답변이 인용한 자료</span>
            </p>
            <h2 className="src-title">근거 {evidences.length}건</h2>
          </div>
          <button type="button" className="src-close" aria-label="근거 목록 닫기" onClick={onClose}>
            <X size={18} aria-hidden />
          </button>
        </header>
        <div className="src-body">
          {evidences.length === 0 ? (
            <div className="src-state" role="status">
              <p className="src-state-title">인용한 근거가 없습니다</p>
              <p className="src-state-text">협회 자료에서 근거를 찾지 못한 답변입니다.</p>
            </div>
          ) : (
            <div className="src-list">
              {evidences.map((e, i) => (
                <EvidenceCard
                  key={e.chunkId}
                  evidence={e}
                  index={i + 1}
                  onOpenSource={onSelect}
                  onDownload={onDownload}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    )
  }

  /* ── 원문 모드 ────────────────────────────────────────────────────────── */
  if (!evidence) return null

  const current = page ?? evidence.pageNo ?? 1
  const total = pageCount ?? Math.max(current, 1)
  const canDownload = Boolean(onDownload && evidence.fileUrl)

  const panel = (
    /* aria-label 로 이름을 준다 — 패널이 뜬 것을 보조기술이 알 수 있어야 한다 */
    <aside className="src-panel" aria-label="출처 원문" data-status={status} data-view="page">
      <header className="src-head">
        <div className="src-head-text">
          {/* 목록에서 온 경우에만 선다 — 답변의 인용 칩으로 바로 연 원문은 목록이 없다 */}
          {onBack && (
            <button type="button" className="src-back" onClick={onBack}>
              <ArrowLeft size={14} aria-hidden />
              근거 목록
            </button>
          )}
          <p className="src-path">
            <span>{evidence.categoryName}</span>
            {(evidence.tableTitle ?? evidence.sectionName) && (
              <span>{evidence.tableTitle ?? evidence.sectionName}</span>
            )}
          </p>
          {/* ★ 제목은 **파일명**이다 (2026-09-03). 받은 파일과 화면에서 본 문서가 같은
              것인지 이름으로 확인하는 자리다. 문서명은 아래 지면 머리가 그대로 말한다 */}
          <h2 className="src-title">{evidence.fileName ?? evidence.documentTitle}</h2>
        </div>
        <button type="button" className="src-close" aria-label="원문 닫기" onClick={onClose}>
          <X size={18} aria-hidden />
        </button>
      </header>

      {/* 도구 줄 — 쪽 이동과 원문 다운로드. 원문을 볼 수 없는 상태에서는 조작할 것이 없다 */}
      {status === 'ready' && (
        <div className="src-tools">
          <div className="src-pager">
            <button
              type="button"
              className="src-tool"
              aria-label="이전 쪽"
              disabled={current <= 1}
              onClick={() => onPageChange?.(current - 1)}
            >
              <ChevronLeft size={16} aria-hidden />
            </button>
            {/* 현재 쪽은 글자로도 말한다 — 화살표 상태만으로는 어디인지 모른다 */}
            <span className="src-page" aria-live="polite">
              {current} / {total}쪽
            </span>
            <button
              type="button"
              className="src-tool"
              aria-label="다음 쪽"
              disabled={current >= total}
              onClick={() => onPageChange?.(current + 1)}
            >
              <ChevronRight size={16} aria-hidden />
            </button>
          </div>

          {/* ★ 확대·축소를 걷고 이 자리를 다운로드에 준다 (2026-09-03).
              뷰어가 실제로 붙으면 확대는 뷰어가 제 방식으로 진다 — 껍데기가 배율을
              따로 들고 있으면 두 배율이 어긋난다. 원문을 통째로 받는 길은 뷰어가
              대신해 주지 못하므로 화면이 갖는다 */}
          <div className="src-tools-right">
            {/* 전체보기 — 좁은 화면에서는 패널이 이미 화면을 다 쓰므로 감춘다 (CSS) */}
            <button
              type="button"
              className="src-expand"
              aria-pressed={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />}
              {expanded ? '작게 보기' : '전체보기'}
            </button>
            {canDownload && (
              <button
                type="button"
                className="src-download"
                onClick={() => onDownload?.(evidence)}
              >
                <Download size={16} aria-hidden />
                원문 다운로드
              </button>
            )}
          </div>
        </div>
      )}

      <div className="src-body">
        {status === 'loading' && (
          <div className="src-state" role="status">
            {/* 상태는 색·애니메이션만이 아니라 글자로도 전달한다 (기획 §11) */}
            <div className="src-skeleton" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </div>
            <p className="src-state-text">원문을 불러오는 중입니다…</p>
          </div>
        )}

        {status === 'unavailable' && (
          <div className="src-state" role="status">
            <AlertTriangle size={28} aria-hidden className="src-state-icon" />
            <p className="src-state-title">원문을 표시할 수 없습니다</p>
            <p className="src-state-text">
              문서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
              <br />
              아래 인용한 근거 내용은 그대로 확인할 수 있습니다.
            </p>
            {onRetry && (
              <Button variant="secondary" size="small" onClick={onRetry}>
                다시 시도
              </Button>
            )}
          </div>
        )}

        {status === 'gone' && (
          <div className="src-state" role="status">
            <FileX size={28} aria-hidden className="src-state-icon" />
            <p className="src-state-title">문서를 찾을 수 없습니다</p>
            <p className="src-state-text">
              삭제되었거나 접근 권한이 없는 문서입니다.
              <br />
              아래 인용한 근거 내용은 그대로 확인할 수 있습니다.
            </p>
          </div>
        )}

        {status === 'ready' && (
          /* 실제 문서 뷰어가 앉을 자리. 지금은 근거 구절을 원문 지면처럼 보여 준다 */
          <div className="src-page-view">
            <div className="src-sheet">
              <p className="src-sheet-meta">
                {evidence.documentTitle} · {current}쪽
              </p>
              {/* 원문 글자가 오면 **그 쪽을 그대로** 보여 준다. 줄바꿈이 지면의 것이라
                  `white-space` 로 살린다. 없으면 답변이 인용한 구절만 보여 준다 */}
              {pageText ? (
                <div className="src-sheet-page">{pageText}</div>
              ) : evidence.blockType === 'table' ? (
                <div
                  className="src-sheet-table"
                  dangerouslySetInnerHTML={{ __html: evidence.chunkContent }}
                />
              ) : (
                <p className="src-sheet-text">{evidence.chunkContent}</p>
              )}
              {/* ★ 캡션(단위·주·출처) 생략 금지 — 빠지면 수치가 맞아도 오독된다 (NFR-008) */}
              {!pageText && evidence.caption && (
                <p className="src-sheet-caption">{evidence.caption}</p>
              )}
            </div>
          </div>
        )}

        {/* 원문을 못 여는 상태에서도 인용 근거는 남긴다 — 확인하러 온 목적이 통째로 막히지 않게 */}
        {(status === 'unavailable' || status === 'gone') && (
          <div className="src-fallback">
            <h3 className="src-fallback-title">답변이 인용한 내용</h3>
            {evidence.blockType === 'table' ? (
              <div
                className="src-sheet-table"
                dangerouslySetInnerHTML={{ __html: evidence.chunkContent }}
              />
            ) : (
              <p className="src-sheet-text">{evidence.chunkContent}</p>
            )}
            {evidence.caption && <p className="src-sheet-caption">{evidence.caption}</p>}
          </div>
        )}
      </div>
    </aside>
  )

  /* 크게 보기 — **부품을 새로 만들지 않는다.** 위 패널을 그대로 창 안에 앉힌다.
     좁은 화면에서 패널이 화면을 덮는 것도 같은 마크업이 CSS 로 그렇게 서는 것이라
     (SourcePanel.css 의 767 분기) 이 셋이 한 코드다.
     창의 X 는 **창만 닫는다** — 원문 자체는 옆 패널로 돌아간다 */
  if (expanded) {
    return (
      <Modal.Root open size="lg" onOpenChange={(o) => !o && setExpanded(false)}>
        <Modal.Content className="src-modal" aria-label="출처 원문 전체보기">
          {panel}
        </Modal.Content>
      </Modal.Root>
    )
  }

  return panel
}
