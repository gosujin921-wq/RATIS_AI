import type { ReactNode } from 'react'
import { Download } from 'lucide-react'
import { DUMMY_ALT, dummyImage } from '../../mocks/samples'
import { cx } from './util'
import { href as withBase } from '../../app/basePath'
import './ResultCard.css'

/**
 * 검색 결과 카드 — 학습데이터 검색·AI 모델 목록처럼 **찾아낸 것을 늘어놓는** 자리의 공용 카드.
 *
 * 일반 `Card` 와 나누는 이유는 담는 것이 다르기 때문이다. 이 카드는 목록에서 하나를 골라내는
 * 자리라 세 가지가 늘 붙는다 — 갈래를 말하는 배지 줄, 얼마나 쓰였는지(다운로드 수),
 * 그리고 즐겨찾기. `Card` 는 그 셋이 없는 일반 카드다.
 *
 * 짜임 (2026-08-07 확정):
 *   대표 이미지 21:9
 *   배지 줄            재난유형 → 증강 → 내·외부 (design.md §4 배지 4종)
 *   제목
 *   요약(선택)
 *   메타 · 다운로드 수  왼쪽에 사실값, 오른쪽에 수치
 *
 * 즐겨찾기는 링크 안에 넣을 수 없어(카드가 통째로 `a`) 형제로 두고 배지 줄과 같은 높이에
 * 얹는다. 그 자리를 폭에서 잡으려고 바깥에 `container-type` 을 건다 — 이미지 높이가 비율
 * (21:9)에서 나오는데 `top` 백분율은 부모 **높이** 기준이라 쓸 수 없다.
 */
export function ResultCard({
  href,
  thumbnail,
  thumbnailIndex,
  noImage,
  badges,
  title,
  summary,
  meta,
  downloadCount,
  action,
  note,
  className,
}: {
  href: string
  /** 실제 경로. 없으면 더미 CCTV 스틸을 깐다 */
  thumbnail?: string
  /** 목록에서 나란히 놓일 때의 자리 번호 — 더미가 자리 순으로 돌아 한 화면에서 겹치지 않는다 */
  thumbnailIndex?: number
  /**
   * 그림을 쓰지 않는 목록. 대표 이미지 자리를 통째로 비운다.
   *
   * **목록 전체에 대한 결정이지 항목별 상태가 아니다** — 그림이 없는 항목이란 것은 없다.
   * AI 모델 목록이 이 경우다: 그림이 재난유형별로 하나뿐이라 같은 유형 카드끼리 똑같아져
   * 고르는 데 쓸 수 없다.
   */
  noImage?: boolean
  /** 갈래를 말하는 배지 줄 (design.md §4 순서: 분류 → 구성 → 출처) */
  badges?: ReactNode
  title: string
  summary?: string
  /** 왼쪽 아래 사실값 (용량 · 녹화일 / 등록일 등) */
  meta?: ReactNode
  /** 오른쪽 아래 수치. 0 도 표시한다 — 없는 것과 안 받은 것은 다르다 */
  downloadCount?: number
  /** 카드 위에 얹는 조작 (즐겨찾기 등). 링크 안에 못 넣어 형제로 받는다 */
  action?: ReactNode
  /**
   * 메타 줄 **아래** 한 줄. 그 화면에만 있는 값을 적는 자리다
   * (즐겨찾기 SCREEN-006 의 `등록일` — 검색 결과에는 없는 값).
   *
   * 카드 밖에 꼬리표로 달지 않는 이유는, 그러면 카드와 값이 따로 놀아 어느 카드의 것인지가
   * 간격으로만 판가름나기 때문이다. 안에 두되 메타보다 한 급 눌러 카드가 지는 값의 차례를
   * 흐리지 않는다.
   */
  note?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('klid-result-card', className)} data-no-image={noImage || undefined}>
      <a className="card" href={withBase(href)}>
        {!noImage && (
          <img
            className="thumb"
            src={thumbnail ?? dummyImage(title, thumbnailIndex)}
            alt={DUMMY_ALT}
          />
        )}
        <span className="body">
          {badges && <span className="badges">{badges}</span>}
          <span className="title">{title}</span>
          {summary && <span className="summary">{summary}</span>}
          <span className="foot">
            {meta && <span className="meta">{meta}</span>}
            {downloadCount !== undefined && (
              <span className="count">
                <Download aria-hidden />
                {downloadCount.toLocaleString()}
              </span>
            )}
          </span>
          {note && <span className="note">{note}</span>}
        </span>
      </a>
      {action}
    </div>
  )
}
