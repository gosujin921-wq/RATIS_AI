import type { MouseEvent } from 'react'
import ratisLogo from '../../assets/ratis-logo.svg'
import './BrandLogo.css'

/**
 * 브랜드 락업 — RATIS 공식 CI 워드마크 + 서비스 표기 `AI`.
 *
 * ★ `AI` 를 **글자로 두지 않는다.** 워드마크와 같은 좌표계(뷰박스 높이 128.75)로 그리고
 *   베이스라인을 RATIS 레터 밑선(y=106.75)에 맞춘다. 글자로 두면 서체 메트릭에 따라
 *   밑선이 어긋나므로, 렌더 높이만 같게 두면 저절로 맞는 구조로 만든다.
 *   `fontSize 58` 은 원본 레터 캡높이(41.75)에 맞춘 값이다.
 *
 * ★ 색을 박지 않는다. `AI` 는 `currentColor` 로 두고 CSS 가 브랜드 앵커를 준다 —
 *   브랜드색이 바뀌면 락업도 같이 따라가야 한다.
 *
 * 크기는 `--logo-h` 로 밖에서 정한다 (기본 3.4rem). 워드마크와 `AI` 가 같은 값을 읽어
 *   둘의 비율이 어떤 크기에서도 유지된다.
 */
export function BrandLogo({
  href = '/chat',
  onClick,
  className,
}: {
  href?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  className?: string
}) {
  return (
    <a
      className={className ? `ratis-logo ${className}` : 'ratis-logo'}
      href={href}
      aria-label="RATIS AI 홈"
      onClick={onClick}
    >
      <img className="ratis-logo-mark" src={ratisLogo} alt="RATIS 방사선기술정보시스템" />
      <svg className="ratis-logo-ai" viewBox="0 0 62 128.75" aria-hidden focusable="false">
        <text
          x="0"
          y="106.75"
          textLength="62"
          lengthAdjust="spacingAndGlyphs"
          /* 「AI」는 Roboto 로 쓴다 — 라틴 두 자라 본문 서체와 다른 굵기·폭을 갖는다 */
          fontFamily="Roboto, system-ui, sans-serif"
          fontSize="58"
          fontWeight="800"
          fill="currentColor"
        >
          AI
        </text>
      </svg>
    </a>
  )
}
