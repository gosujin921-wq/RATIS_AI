import { Button } from 'krds-react'
import { AlertTriangle, ChevronLeft, ChevronRight, FileX, Minus, Plus, X } from 'lucide-react'
import type { Evidence } from '../../api/types'
import './SourcePanel.css'

/**
 * 출처 원문 확인 패널 (기획 §5.5 · §12.1 필수).
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

const ZOOM_STEPS = [50, 75, 100, 125, 150, 200] as const

export function SourcePanel({
  evidence,
  status = 'ready',
  page,
  pageCount,
  zoom = 100,
  onPageChange,
  onZoomChange,
  onRetry,
  onClose,
}: {
  /** null 이면 패널이 서지 않는다 */
  evidence: Evidence | null
  status?: SourceStatus
  /** 지금 보고 있는 쪽. 없으면 근거의 pageNo 를 쓴다 */
  page?: number | null
  pageCount?: number
  zoom?: number
  onPageChange?: (next: number) => void
  onZoomChange?: (next: number) => void
  onRetry?: () => void
  onClose?: () => void
}) {
  if (!evidence) return null

  const current = page ?? evidence.pageNo ?? 1
  const total = pageCount ?? Math.max(current, 1)
  const zoomIndex = ZOOM_STEPS.findIndex((z) => z >= zoom)
  const stepZoom = (by: number) => {
    const i = Math.min(ZOOM_STEPS.length - 1, Math.max(0, (zoomIndex < 0 ? 2 : zoomIndex) + by))
    onZoomChange?.(ZOOM_STEPS[i])
  }

  return (
    /* aria-label 로 이름을 준다 — 패널이 뜬 것을 보조기술이 알 수 있어야 한다 */
    <aside className="src-panel" aria-label="출처 원문" data-status={status}>
      <header className="src-head">
        <div className="src-head-text">
          <p className="src-path">
            <span>{evidence.categoryName}</span>
            {(evidence.tableTitle ?? evidence.sectionName) && (
              <span>{evidence.tableTitle ?? evidence.sectionName}</span>
            )}
          </p>
          <h2 className="src-title">{evidence.documentTitle}</h2>
        </div>
        <button type="button" className="src-close" aria-label="원문 닫기" onClick={onClose}>
          <X size={18} aria-hidden />
        </button>
      </header>

      {/* 도구 줄 — 쪽 이동과 확대·축소. 원문을 볼 수 없는 상태에서는 조작할 것이 없다 */}
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

          <div className="src-zoom">
            <button
              type="button"
              className="src-tool"
              aria-label="축소"
              disabled={zoom <= ZOOM_STEPS[0]}
              onClick={() => stepZoom(-1)}
            >
              <Minus size={16} aria-hidden />
            </button>
            <button type="button" className="src-zoom-value" onClick={() => onZoomChange?.(100)}>
              {zoom}%
            </button>
            <button
              type="button"
              className="src-tool"
              aria-label="확대"
              disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              onClick={() => stepZoom(1)}
            >
              <Plus size={16} aria-hidden />
            </button>
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
          <div className="src-page-view" style={{ ['--src-zoom' as string]: zoom / 100 }}>
            <div className="src-sheet">
              <p className="src-sheet-meta">
                {evidence.documentTitle} · {current}쪽
              </p>
              {evidence.blockType === 'table' ? (
                <div
                  className="src-sheet-table"
                  dangerouslySetInnerHTML={{ __html: evidence.chunkContent }}
                />
              ) : (
                <p className="src-sheet-text">{evidence.chunkContent}</p>
              )}
              {/* ★ 캡션(단위·주·출처) 생략 금지 — 빠지면 수치가 맞아도 오독된다 (NFR-008) */}
              {evidence.caption && <p className="src-sheet-caption">{evidence.caption}</p>}
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
}
