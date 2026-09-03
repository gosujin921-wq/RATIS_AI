import type { ReactNode } from 'react'
import { cx } from './util'
import './QaBlock.css'

/**
 * Q·A 덩이 — 왼쪽에 Q·A 표식, 오른쪽에 제목 한 줄과 그 아래 내용.
 * FAQ 카드형 아코디언이 CSS 로 자동으로 그리던 그 표식을, 아코디언이 아닌 자리에서도 쓴다.
 * 문의 상세가 첫 쓰임이다 — 질문과 답변이 표식으로 갈리므로 글을 상자에 가둘 필요가 없다.
 *
 * 표식의 치수·라운드·색은 **이 부품의 CSS(`--ratis-qa-mark-*`)가 정본**이다.
 * 여기서 따로 정하지 않는다 — FAQ 와 늘 같은 얼굴이어야 하기 때문이다.
 *
 * 표식 글자(Q·A)는 그림이라 보조기술이 읽지 않는다. 무엇인지는 옆 제목이 말한다.
 */
export function QaBlock({
  kind,
  title,
  meta,
  children,
  className,
}: {
  /** question = 파란 Q · answer = 회색 A */
  kind: 'question' | 'answer'
  /** 표식 옆 한 줄 (예: 문의 내용 · 답변) */
  title: ReactNode
  /** 제목 뒤에 흐리게 붙는 곁말. 답변 시각 같은 것 */
  meta?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cx('ratis-qa-block', className)} data-kind={kind}>
      <span className="ratis-qa-mark" aria-hidden>
        {kind === 'question' ? 'Q' : 'A'}
      </span>
      <div className="ratis-qa-body">
        {/* 상세 화면·모달의 제목(h3) 아래 구획이라 h4 다 */}
        <h4 className="ratis-qa-title">
          {title}
          {meta && <span className="ratis-qa-when">{meta}</span>}
        </h4>
        <div className="ratis-qa-content">{children}</div>
      </div>
    </div>
  )
}
