import { createContext, useContext, useId, useRef, useState, type ReactNode } from 'react'
import { cx } from '../custom/util'
import './Tabs.css'

interface TabsCtx {
  value: string
  setValue: (v: string) => void
  /** 트리거·패널이 서로를 가리키는 id 의 뿌리. 한 화면에 탭이 둘이어도 안 섞인다 */
  base: string
}
const Ctx = createContext<TabsCtx | null>(null)

function useTabs(who: string) {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error(`${who} 는 <Tab> 안에서만 쓴다`)
  return ctx
}

/**
 * 탭 — **같은 자리에 서는 여러 벌의 목록**을 갈아 끼운다 (약관·방침의 종류별 버전 목록).
 *
 * 언제 탭인가: 갈래마다 목록의 뼈대(열·조작)가 같고, 한 번에 하나만 보면 되는 자리다.
 * 갈래를 견줘야 하면 탭이 아니라 한 화면에 나란히 세운다 — 탭은 옆칸을 가리는 물건이다.
 * 갈래가 조건의 하나일 뿐이면(상태·유형 거르기) 탭이 아니라 조건 줄의 캡슐이다.
 *
 * 값은 안에서 들거나(비제어) 밖에서 준다(제어). 화면이 탭을 주소·조회 조건과 묶어야 하면
 * `value` + `onValueChange` 로 밖에서 든다.
 *
 * 키보드는 탭 목록의 표준을 따른다 — ←→ 로 옮기고 Home·End 로 양끝. 초점이 옮겨 가면
 * 그 자리가 곧 열린 탭이다(자동 활성). 목록이 가벼워 미리 그려도 값이 싸다.
 */
export function Tab({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  className?: string
}) {
  const base = useId()
  const [inner, setInner] = useState(defaultValue ?? '')
  const current = value ?? inner
  const setValue = (v: string) => {
    if (value === undefined) setInner(v)
    onValueChange?.(v)
  }
  return (
    <Ctx.Provider value={{ value: current, setValue, base }}>
      <div className={cx('ratis-tabs', className)}>{children}</div>
    </Ctx.Provider>
  )
}

/** 탭 이름들이 서는 줄 */
export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  /* 좌우 키로 옮긴다. 어느 것이 몇 번째인지는 그려진 순서가 말하므로 DOM 에서 읽는다 —
     자식 목록을 따로 들고 있으면 갈래가 늘 때마다 두 곳을 고쳐야 한다 */
  const move = (step: number, to?: 'first' | 'last') => {
    const tabs = [...(ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])]
    if (!tabs.length) return
    const at = tabs.findIndex((t) => t === document.activeElement)
    const next =
      to === 'first' ? 0 : to === 'last' ? tabs.length - 1 : (at + step + tabs.length) % tabs.length
    tabs[next]?.focus()
    tabs[next]?.click()
  }

  return (
    <div
      ref={ref}
      role="tablist"
      className={cx('ratis-tablist', className)}
      onKeyDown={(e) => {
        const key = e.key
        if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') return
        e.preventDefault()
        if (key === 'ArrowLeft') move(-1)
        if (key === 'ArrowRight') move(1)
        if (key === 'Home') move(0, 'first')
        if (key === 'End') move(0, 'last')
      }}
    >
      {children}
    </div>
  )
}

/** 탭 이름 하나 */
export function TabTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const { value: current, setValue, base } = useTabs('TabTrigger')
  const on = current === value
  return (
    <button
      type="button"
      role="tab"
      id={`${base}-tab-${value}`}
      aria-selected={on}
      aria-controls={`${base}-panel-${value}`}
      /* 열리지 않은 탭은 Tab 키가 건너뛴다 — 줄 안에서는 좌우 키로 옮긴다 */
      tabIndex={on ? 0 : -1}
      className={cx('ratis-tab', className)}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  )
}

/** 패널들이 사는 자리. 줄과 내용 사이의 간격을 진다 */
export function TabContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('ratis-tab-content', className)}>{children}</div>
}

/** 탭 하나가 여는 내용 */
export function TabPanel({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const { value: current, base } = useTabs('TabPanel')
  const on = current === value
  return (
    <div
      role="tabpanel"
      id={`${base}-panel-${value}`}
      aria-labelledby={`${base}-tab-${value}`}
      /* 닫힌 패널은 문서에서 감춘다 — 남겨 두면 보조기술이 안 보이는 목록까지 읽는다 */
      hidden={!on}
      /* 패널 안에 초점 받을 것이 없을 수 있어 패널 자신이 받는다 */
      tabIndex={on ? 0 : undefined}
      className={cx('ratis-tab-panel', className)}
    >
      {on ? children : null}
    </div>
  )
}
