import type { ReactNode } from 'react'
import { Download } from 'lucide-react'
import { cx } from './util'
import { href as withBase } from '../../app/basePath'
import './ResultRow.css'

/**
 * 검색 결과 로우 — 목록에서 하나를 골라내는 자리의 **가로 한 줄** 짜임.
 *
 * `ResultCard` 와 담는 값은 같다 (갈래 표시 · 제목 · 요약 · 메타 · 다운로드 수). 나누는 것은
 * 배치다. 카드는 대표 이미지가 먼저 읽혀야 하는 목록의 것이고, 로우는 **그림이 없어 글자만
 * 남는 목록**의 것이다. 그림 없는 카드를 3열로 세우면 칸 안에 텍스트만 남아 카드일 이유가
 * 사라지는데, 로우로 눕히면 제목이 왼쪽 한 줄로 줄맞춰 서서 훑는 속도가 붙는다.
 *
 * 한 컴포넌트 안에서 갈래로 치지 않은 이유는 이미지 자리(21:9 · `container-type` 기준점)가
 * 통째로 없어지고 갈래 표시가 배지 줄에서 왼쪽 타일로 자리를 옮기기 때문이다. 두 배치의
 * CSS 가 서로를 밟는다.
 *
 * 짜임:
 *   [ lead 56 ]  제목            등록일   다운로드 수
 *                요약 한 줄
 */
export function ResultRow({
  href,
  lead,
  title,
  summary,
  meta,
  downloadCount,
  actions,
  className,
}: {
  href: string
  /** 왼쪽 고정 폭 자리 — 갈래를 말하는 타일 (EventTypeTile 등) */
  lead?: ReactNode
  title: string
  /** 한 줄 말줄임. 로우는 폭이 넓어 카드(두 줄)보다 한 줄에 더 담긴다 */
  summary?: string
  /** 오른쪽 사실값 (등록일 등) */
  meta?: ReactNode
  /** 오른쪽 수치. 0 도 표시한다 — 없는 것과 안 받은 것은 다르다 */
  downloadCount?: number
  /**
   * 줄에 붙는 조작 (즐겨찾기 SCREEN-006 의 해제).
   *
   * **링크(`.card`) 밖, 그 옆에 선다** — 버튼을 링크 안에 넣을 수 없다(중첩 금지).
   * 검색 결과(SCREEN-004)·AI 모델 목록(SCREEN-033)은 넘기지 않는다: 거기는 골라 들어가는
   * 자리라 줄이 하는 일이 하나뿐이다.
   */
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('ratis-result-row', className)} data-has-actions={actions ? true : undefined}>
      <a className="card" href={withBase(href)}>
        {lead}
        <span className="body">
          <span className="title">{title}</span>
          {summary && <span className="summary">{summary}</span>}
        </span>
        <span className="foot">
          {meta && <span className="meta">{meta}</span>}
          {/* 등록일과 다운로드 수를 가르는 세로선 (공용 `.ratis-meta-div`). **좁은 폭에서만
              보인다** — 넓은 폭은 둘이 줄 오른쪽 끝에 떨어져 서서 선 없이도 갈래가 읽힌다 */}
          {meta && downloadCount !== undefined && <span className="ratis-meta-div" aria-hidden />}
          {downloadCount !== undefined && (
            <span className="count">
              <Download aria-hidden />
              {downloadCount.toLocaleString()}
            </span>
          )}
        </span>
      </a>
      {actions && (
        <span className="acts" role="group" aria-label={`${title} 관리`}>
          {actions}
        </span>
      )}
    </div>
  )
}
