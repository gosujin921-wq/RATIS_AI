import type { CSSProperties, ReactNode } from 'react'
import { DUMMY_ALT, dummyImage } from '../../mocks/samples'
import { cx } from './util'
import { href as withBase } from '../../app/basePath'
import './Card.css'

/**
 * 목록 카드 — 썸네일 + 제목 + 요약 + 메타로 이뤄진 그리드 카드.
 * KRDS 에 대응 컴포넌트가 없어 직접 만든다 (기획서가 부르는 이름도 Card).
 * 활용사례(SCREEN-019) · AI 모델 목록(SCREEN-033) · 학습데이터 검색 결과가 공유한다.
 *
 * 치수 기준: design.md §5 표면(흰 면 · slate 보더 · 라운드 16) · §6 그리드 간격(카드 16).
 * 카드 전체가 링크라 안에 다른 링크·버튼을 넣지 않는다 (중첩 링크 금지).
 * 여러 장을 늘어놓을 때는 함께 정의된 `.klid-card-grid` 를 쓴다.
 */
export function Card({
  href,
  thumbnail,
  thumbnailAlt,
  thumbnailPlaceholder,
  thumbnailIndex,
  badge,
  title,
  summary,
  meta,
  compact,
  className,
  style,
}: {
  href: string
  thumbnail?: string
  thumbnailAlt?: string
  /**
   * 이미지가 들어올 자리인데 실제 경로가 아직 없을 때. 이미지가 아예 없는 카드는 켜지 않는다.
   * 켜면 더미 CCTV 스틸을 깐다 — 빈 회색 면으로는 카드 비율·글자 자리를 판단할 수 없다.
   * 그림은 제목에서 정하므로 나란히 놓인 카드끼리 갈린다.
   */
  thumbnailPlaceholder?: boolean
  /** 목록에서 나란히 놓일 때의 자리 번호. 주면 더미가 자리 순으로 돌아 한 화면에서 겹치지 않는다 */
  thumbnailIndex?: number
  /** 제목 위 배지류 (재난 유형 등) */
  badge?: ReactNode
  title: string
  /** 2줄 미리보기. 넘치면 말줄임 */
  summary?: string
  /** 하단 보조 정보 (등록일 등) */
  meta?: ReactNode
  /** 추천·연관처럼 그 화면의 본 목록이 아닌 자리. 썸네일을 한 단계 낮춰 카드 세로를 줄인다 */
  compact?: boolean
  className?: string
  /** 화면이 카드마다 다르게 주는 값 (유형 색 띠 등). 치수는 여기로 넘기지 않는다 */
  style?: CSSProperties
}) {
  return (
    <a
      href={withBase(href)}
      className={cx('klid-card', className)}
      data-compact={compact || undefined}
      style={style}
    >
      {thumbnail && <img className="thumb" src={thumbnail} alt={thumbnailAlt ?? ''} />}
      {!thumbnail && thumbnailPlaceholder && (
        <img className="thumb" src={dummyImage(title, thumbnailIndex)} alt={DUMMY_ALT} />
      )}
      <span className="body">
        {badge && <span className="badge-row">{badge}</span>}
        <span className="title">{title}</span>
        {summary && <span className="summary">{summary}</span>}
        {meta && <span className="meta">{meta}</span>}
      </span>
    </a>
  )
}
