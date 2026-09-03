import { useId, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cx } from '../custom/util'
import './Disclosure.css'

/**
 * 접이식 — 토글 한 줄과 그 아래 패널.
 *
 * ★ `aria-expanded` · `aria-controls` · 패널 id 를 **부품이 잇는다.** 손으로 이으면
 *   화면마다 하나씩 빠진다 (실제로 킷을 쓰던 이유가 그것이었다).
 * ★ 열림 상태는 **쓰는 쪽이 갖는다** — 접힌 채로 시작할지, 다른 것을 열면 닫을지는
 *   그 화면의 규칙이다.
 * ★ 이름은 `ReactNode` 를 받는다. 토글 안에 숫자·배지를 다른 급으로 세우는 자리가 있다
 *   (킷은 여기가 `string` 이라 캐스팅해서 써야 했다).
 */
export function Disclosure({
  buttonText,
  expanded,
  onToggle,
  id,
  className,
  children,
}: {
  buttonText: ReactNode
  expanded: boolean
  onToggle: (next: boolean) => void
  id?: string
  className?: string
  children: ReactNode
}) {
  const auto = useId()
  const panelId = `${id ?? auto}-panel`
  return (
    <div className={cx('ratis-disclosure', className)}>
      <button
        type="button"
        className="ratis-disclosure-toggle"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => onToggle(!expanded)}
      >
        <ChevronDown className="ratis-disclosure-caret" size={16} aria-hidden />
        {buttonText}
      </button>
      {/* 닫혀도 지우지 않고 `hidden` 으로 감춘다 — 토글의 `aria-controls` 가 가리키는
          대상이 사라지면 보조기술이 관계를 잃는다 */}
      <div className="ratis-disclosure-panel" id={panelId} hidden={!expanded}>
        {children}
      </div>
    </div>
  )
}
