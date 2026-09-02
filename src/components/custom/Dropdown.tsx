import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cx } from './util'
import './Dropdown.css'

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

/**
 * 드롭다운 (선택 전용 콤보박스) — 킷 `Select` 를 대신한다.
 *
 * 킷 Select 는 네이티브 `<select>` 다. 닫힌 모양은 CSS 로 우리 값(보더 gray-30 · 라운드 8 ·
 * 패딩 12/36)을 줄 수 있지만 **펼친 목록은 OS 가 그린다** — 항목 높이·라운드·hover·선택 표시를
 * 우리가 못 정한다. 조건이 아홉인 필터 패널에서 목록만 운영체제 모양으로 열리면 그 순간
 * 화면이 두 갈래로 갈린다. 그래서 목록을 직접 그린다.
 *
 * 대가: 네이티브가 공짜로 주던 것(키보드·모바일 휠 피커·보조기술 이름)을 직접 짜야 한다.
 * ARIA APG 의 **Select-Only Combobox** 패턴을 그대로 따른다 —
 *   · 트리거는 `role="combobox"` + `aria-expanded` + `aria-controls`
 *   · 포커스는 **트리거에 머물고**, 지금 가리키는 항목은 `aria-activedescendant` 로만 옮긴다
 *     (포커스를 항목으로 옮기면 목록을 닫을 때 되돌릴 자리를 놓친다)
 *   · 목록은 `role="listbox"`, 항목은 `role="option"` + `aria-selected`
 *
 * 키보드: ↓↑ 이동 · Home·End 양끝 · Enter·Space 확정 · Esc 취소 · Tab 닫고 통과 ·
 * 글자 입력하면 그 글자로 시작하는 항목으로 건너뛴다(네이티브가 하던 일).
 *
 * variant
 *   default  보더 있는 폼 컨트롤 (필터 조건)
 *   sorting  보더 없는 글자만 (목록 위 정렬 기준). 폼이 아니라 목록에 얹히는 조작이라 면이 없다
 */
export function Dropdown({
  options,
  value,
  defaultValue,
  onChange,
  size = 'medium',
  variant = 'default',
  disabled,
  placeholder = '선택',
  className,
  'aria-label': ariaLabel,
}: {
  options: readonly DropdownOption[]
  /** 넘기면 제어형. 안 넘기면 `defaultValue` 로 시작하는 비제어형 */
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'sorting'
  disabled?: boolean
  /** 고른 값이 목록에 없을 때만 보인다. 값이 `''` 인 항목이 있으면 그 라벨이 이긴다 */
  placeholder?: string
  className?: string
  /** 라벨을 밖(FilterPanel.Field)에서 달기 때문에 필수 */
  'aria-label': string
}) {
  const [inner, setInner] = useState(defaultValue ?? '')
  const current = value ?? inner

  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  /** 연속으로 친 글자를 모아 둔다. 1초 쉬면 비운다 (네이티브 select 와 같은 셈) */
  const typed = useRef({ text: '', timer: 0 })

  const id = useId()
  const listId = `${id}-list`
  const optionId = (i: number) => `${id}-opt-${i}`

  const selectedIndex = useMemo(
    () => options.findIndex((o) => o.value === current),
    [options, current],
  )
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined

  /** 못 고르는 항목은 건너뛰며 다음 자리를 찾는다. 끝에서 멈춘다 (순환하지 않는다 — 순환하면
      목록의 끝을 손끝으로 알 수 없다) */
  const step = (from: number, dir: 1 | -1) => {
    for (let i = from + dir; i >= 0 && i < options.length; i += dir) {
      if (!options[i].disabled) return i
    }
    return from
  }
  const edge = (dir: 1 | -1) =>
    dir === 1 ? step(-1, 1) : step(options.length, -1)

  const openList = (at?: number) => {
    if (disabled) return
    setActive(at ?? (selectedIndex >= 0 ? selectedIndex : edge(1)))
    setOpen(true)
  }
  const close = (focusTrigger = true) => {
    setOpen(false)
    setActive(-1)
    if (focusTrigger) triggerRef.current?.focus()
  }
  const commit = (i: number) => {
    const opt = options[i]
    if (!opt || opt.disabled) return
    if (value === undefined) setInner(opt.value)
    onChange?.(opt.value)
    close()
  }

  /* 바깥을 누르면 닫는다. click 이 아니라 pointerdown 이라야 — 누른 자리에서 곧바로 닫혀야
     그 클릭이 아래 요소에 그대로 닿는다 (click 을 기다리면 한 번은 닫기에만 쓰인다) */
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  /* 가리키는 항목이 목록 밖으로 나가면 끌어온다. 포커스가 트리거에 있어 브라우저가 대신
     스크롤해 주지 않는다 — activedescendant 패턴이 직접 져야 하는 몫이다 */
  useEffect(() => {
    if (!open || active < 0) return
    listRef.current
      ?.querySelector(`#${CSS.escape(optionId(active))}`)
      ?.scrollIntoView({ block: 'nearest' })
  })

  useEffect(() => () => window.clearTimeout(typed.current.timer), [])

  const typeahead = (ch: string) => {
    window.clearTimeout(typed.current.timer)
    typed.current.text += ch.toLowerCase()
    typed.current.timer = window.setTimeout(() => {
      typed.current.text = ''
    }, 1000)

    const q = typed.current.text
    const from = (open ? active : selectedIndex) + 1
    /* 지금 자리 **다음**부터 한 바퀴 돈다. 같은 글자를 거듭 치면 그 글자로 시작하는 항목들을
       차례로 훑게 된다 (네이티브 select 의 동작) */
    for (let n = 0; n < options.length; n += 1) {
      const i = (from + n) % options.length
      const o = options[i]
      if (!o.disabled && o.label.toLowerCase().startsWith(q)) {
        if (open) setActive(i)
        else openList(i)
        return
      }
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault()
        const dir = e.key === 'ArrowDown' ? 1 : -1
        if (!open) openList()
        else setActive((i) => step(i, dir))
        return
      }
      case 'Home':
      case 'End': {
        e.preventDefault()
        const at = edge(e.key === 'Home' ? 1 : -1)
        if (!open) openList(at)
        else setActive(at)
        return
      }
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open) commit(active)
        else openList()
        return
      case 'Escape':
        if (open) {
          e.preventDefault()
          close()
        }
        return
      case 'Tab':
        /* 막지 않는다 — 목록만 닫고 포커스는 다음 컨트롤로 흘려보낸다.
           고르던 값은 버린다 (Esc 와 같다). 확정은 Enter 로만 */
        if (open) close(false)
        return
      default:
        if (e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          typeahead(e.key)
        }
    }
  }

  return (
    <div
      ref={rootRef}
      className={cx('klid-dropdown', className)}
      data-size={size}
      data-variant={variant}
      data-open={open || undefined}
    >
      <button
        ref={triggerRef}
        type="button"
        className="trigger"
        role="combobox"
        aria-label={ariaLabel}
        aria-controls={listId}
        aria-expanded={open}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
      >
        <span className="value" data-placeholder={selected ? undefined : true}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown aria-hidden />
      </button>

      {/* 닫혀도 지우지 않고 `hidden` 으로 감춘다 — 트리거의 `aria-controls` 가 가리키는
          대상이 사라지면 보조기술이 관계를 잃는다 */}
      <ul ref={listRef} id={listId} className="list" role="listbox" aria-label={ariaLabel} hidden={!open}>
        {options.map((o, i) => (
          <li
            key={o.value}
            id={optionId(i)}
            role="option"
            className="option"
            aria-selected={i === selectedIndex}
            aria-disabled={o.disabled || undefined}
            data-active={i === active || undefined}
            /* 누르는 순간 트리거에서 포커스가 빠지지 않게 막는다 — activedescendant 패턴은
               포커스가 트리거에 머무는 것이 전제다 */
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => commit(i)}
            onPointerMove={() => !o.disabled && setActive(i)}
          >
            <span className="label">{o.label}</span>
            {i === selectedIndex && <Check aria-hidden />}
          </li>
        ))}
      </ul>
    </div>
  )
}
