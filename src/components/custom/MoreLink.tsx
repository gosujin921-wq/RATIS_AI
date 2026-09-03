import { ChevronRight } from 'lucide-react'
import { cx } from './util'
import { href as withBase } from '../../app/basePath'
import './MoreLink.css'

/**
 * 섹션 우상단 "전체보기" 링크.
 * 표기·아이콘 고정. ChevronRight 만 쓴다 (ArrowRight·화살표 문자 금지).
 * 라우터 도입 전이라 a 태그. 도입 시 Link 로 교체.
 */
export function MoreLink({
  href,
  label = '전체보기',
  className,
}: {
  href: string
  label?: string
  className?: string
}) {
  return (
    <a href={withBase(href)} className={cx('ratis-more-link', className)}>
      {label}
      <ChevronRight aria-hidden />
    </a>
  )
}
