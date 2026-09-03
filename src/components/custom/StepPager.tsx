import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from './util'
import { href as withBase } from '../../app/basePath'
import './StepPager.css'

export interface StepPagerLink {
  /** 순서 표시 (예: '2단계'). 없으면 방향 문구만 보인다 */
  ordinal?: string
  label: string
  href: string
}

/**
 * 순서가 있는 문서를 여러 화면으로 나눠 놓았을 때 본문 맨 아래에 두는 앞·다음 이동.
 * 한 화면을 다 읽고 나면 다음이 어디인지 알려주는 자리다 — 없으면 막다른 길이 된다.
 *
 * 처음·끝 단계는 한쪽이 빈다. 빈 쪽을 다른 것으로 채우지 않고 자리만 남긴다 —
 * 좌우 자리가 고정돼야 화면을 옮겨 다녀도 이전·다음이 같은 위치에서 읽힌다.
 */
export function StepPager({
  prev,
  next,
  label = '단계 이동',
  className,
}: {
  prev?: StepPagerLink
  next?: StepPagerLink
  /** 읽어주는 이름. 단계가 아닌 글 이동에 쓸 때 화면이 바꿔 꽂는다 */
  label?: string
  className?: string
}) {
  if (!prev && !next) return null

  return (
    <nav className={cx('ratis-step-pager', className)} aria-label={label}>
      {prev ? (
        <a className="ratis-step-pager-link" href={withBase(prev.href)} data-dir="prev">
          <ChevronLeft aria-hidden />
          <span className="body">
            <span className="dir">이전 {prev.ordinal}</span>
            <span className="label">{prev.label}</span>
          </span>
        </a>
      ) : (
        <span aria-hidden />
      )}

      {next ? (
        <a className="ratis-step-pager-link" href={withBase(next.href)} data-dir="next">
          <span className="body">
            <span className="dir">다음 {next.ordinal}</span>
            <span className="label">{next.label}</span>
          </span>
          <ChevronRight aria-hidden />
        </a>
      ) : (
        <span aria-hidden />
      )}
    </nav>
  )
}
