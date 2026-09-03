import type { ReactNode } from 'react'
import { cloneElement, createContext, isValidElement, useContext, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cx } from '../custom/util'
import './Modal.css'

/**
 * 창(모달) — 이 서비스의 창은 전부 이 하나로 선다.
 *
 * ★ 여백·정렬을 **깊은 셀렉터로 걸지 않는다.** 종전에 쓰던 외부 킷은 0-3-0 짜리 셀렉터로
 *   걸어 두어, 창 하나를 우리 규격으로 세울 때마다 특정도를 0-4-0 까지 올려 이겨야 했다.
 *
 * 접근성은 여기서 함께 진다.
 *   · `role="dialog"` + `aria-modal` + **창을 열 때 초점을 안으로** 옮기고 닫을 때 되돌린다
 *     (초점을 그대로 두면 키보드 사용자가 창 밖에 남는다)
 *   · Tab 이 창 안에서 돈다 (초점 가둠)
 *   · Esc · 가림막 누르기로 닫는다
 *   · 열려 있는 동안 뒤 화면 스크롤을 잠근다
 *   · 이름은 쓰는 쪽이 `aria-labelledby` 로 잇는다 — 이 자리가 비면 보조기술이
 *     「대화상자」라고만 읽는다
 *
 * 조립식이다: `Modal.Root > Modal.Content > (Header · Title · Body · Footer)`.
 */

type Ctx = { onOpenChange: (open: boolean) => void }
const ModalCtx = createContext<Ctx>({ onOpenChange: () => {} })

export type ModalSize = 'sm' | 'md' | 'lg'

function Root({
  open,
  onOpenChange,
  size = 'sm',
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** sm 40 — 결정을 묻는 창 · md 56 — 목록·검색 · lg 72 — 미리보기 */
  size?: ModalSize
  children: ReactNode
}) {
  /* 열려 있는 동안 뒤 화면은 스크롤하지 않는다 — 창 뒤에서 목록이 흘러가면
     무엇을 보고 있었는지 잃는다 */
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  /* Esc — 창에서 나가는 길이 X 하나뿐이면 키보드로는 갇힌다 */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (!open) return null

  return createPortal(
    <ModalCtx.Provider value={{ onOpenChange }}>
      {/* 셸 밖(body)에 그린다 — 창은 화면 전체를 덮는 것이라, 화면 안쪽에 두면
          부모의 overflow·transform 에 잘리거나 쌓임 맥락에 갇힌다 */}
      <div className="ratis-modal" data-size={size}>
        <div className="ratis-modal-scrim" onClick={() => onOpenChange(false)} />
        {children}
      </div>
    </ModalCtx.Provider>,
    document.body,
  )
}

function Content({
  className,
  children,
  ...rest
}: { className?: string; children: ReactNode } & React.ComponentPropsWithoutRef<'div'>) {
  const { onOpenChange } = useContext(ModalCtx)
  const ref = useRef<HTMLDivElement>(null)

  /* 초점을 창 안으로 옮기고, 닫을 때 열었던 자리로 되돌린다.
     되돌리지 않으면 키보드 사용자는 창을 닫은 뒤 문서 맨 앞으로 튕긴다 */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const first = ref.current?.querySelector<HTMLElement>(
      'input, textarea, select, button, a[href], [tabindex]:not([tabindex="-1"])',
    )
    ;(first ?? ref.current)?.focus()
    return () => opener?.focus?.()
  }, [])

  /* Tab 을 창 안에 가둔다 — 뒤 화면으로 새어 나가면 보이지 않는 것에 초점이 간다 */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !ref.current) return
    const items = ref.current.querySelectorAll<HTMLElement>(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    )
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      ref={ref}
      className={cx('ratis-modal-panel', className)}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {/* 닫기는 창이 갖는다 — 쓰는 쪽이 매번 다시 만들면 자리가 창마다 갈린다.
          아래 걸음 줄에 「닫기」를 또 두지 않는다 (design.md — 여기 X 가 이미 그 일을 한다) */}
      <button
        type="button"
        className="ratis-modal-close"
        aria-label="닫기"
        onClick={() => onOpenChange(false)}
      >
        {/* 크기는 CSS 가 아이콘 사다리에서 준다 (Modal.css) — 여기 숫자를 박으면
            닫기 자리를 계산하는 쪽과 값이 갈린다 */}
        <X aria-hidden />
      </button>
      {children}
    </div>
  )
}

function Header({ title, children }: { title?: ReactNode; children?: ReactNode }) {
  return (
    <div className="ratis-modal-head">
      {title ? <h2 className="ratis-modal-title">{title}</h2> : children}
    </div>
  )
}

function Title({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 className="ratis-modal-title" id={id}>
      {children}
    </h2>
  )
}

function Body({ children }: { children: ReactNode }) {
  return <div className="ratis-modal-body">{children}</div>
}

function Footer({ children }: { children: ReactNode }) {
  return <div className="ratis-modal-foot">{children}</div>
}

/** 누르면 창이 닫히는 걸음. 자식 버튼의 onClick 뒤에 닫기를 덧붙인다 */
function Close({ children }: { asChild?: boolean; children: ReactNode }) {
  const { onOpenChange } = useContext(ModalCtx)
  if (!isValidElement(children)) return <>{children}</>
  const child = children as React.ReactElement<{ onClick?: (e: unknown) => void }>
  return cloneElement(child, {
    onClick: (e: unknown) => {
      child.props.onClick?.(e)
      onOpenChange(false)
    },
  })
}

export const Modal = { Root, Content, Header, Title, Body, Footer, Close }
