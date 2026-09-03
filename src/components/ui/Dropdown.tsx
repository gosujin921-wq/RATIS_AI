import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cx } from '../custom/util'
import { Tooltip } from './Tooltip'
import './Field.css'
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
 * 여러 갈래를 함께 켜야 하는 자리는 `multiple` 이다 (챗봇 검색 범위) — 켜진 줄마다 체크가
 * 서고 고른 것은 트리거에 요약해 적는다. 화면 아래쪽에 서는 트리거는 `placement="up"` 으로 목록을
 * 위로 펼친다.
 *
 * 조건 줄에 이름표를 따로 세울 자리가 없을 때는 `label` 로 **트리거 안에 이름을 붙인다** —
 * 고른 값만 서 있으면 「전체」 두 개가 나란히 서서 무엇을 거르는 조건인지 화면에서 사라진다.
 *
 * variant
 *   default  보더 있는 폼 컨트롤 (필터 조건)
 *   sorting  보더 없는 글자만 (목록 위 정렬 기준). 폼이 아니라 목록에 얹히는 조작이라 면이 없다
 *   capsule  알약. `default` 에서 **라운드와 폭 잡는 법만** 다르다 — 모서리가 알약이고,
 *            줄을 채우지 않고 고른 값 길이만큼만 선다. 칩·캡슐 입력과 한 줄에 서는 조건 줄에
 *            쓴다. 반대로 한 줄에 각진 폼 컨트롤이 서 있으면 `default` 로 둔다 — 섞으면
 *            같은 줄이 두 모양으로 갈린다
 */
export function Dropdown({
  options,
  value,
  defaultValue,
  onChange,
  multiple,
  values,
  onChangeValues,
  size = 'medium',
  variant = 'default',
  placement = 'down',
  disabled,
  label,
  placeholder = '선택',
  className,
  'aria-label': ariaLabel,
}: {
  options: readonly DropdownOption[]
  /** 넘기면 제어형. 안 넘기면 `defaultValue` 로 시작하는 비제어형 */
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /**
   * 여러 갈래를 함께 켠다 (검색 범위처럼 조건이 겹칠 수 있는 자리).
   * 값은 `values` / `onChangeValues` 로 오간다.
   *   · 고르면 **목록이 닫히지 않는다** — 겹쳐 고르는 자리라 한 번에 하나씩 닫히면
   *     같은 목록을 몇 번이고 다시 열어야 한다
   *   · 값이 `''` 인 항목은 **모두 해제**하는 자리가 된다 (「전체」). 아무것도 안 골랐을 때
   *     그 줄에 체크가 서므로, 비어 있는 상태가 「못 고른 상태」가 아니라 「전체」로 읽힌다
   *   · 트리거는 고른 것을 요약해 적는다 — 하나면 그 이름, 둘 이상이면 「A 외 n건」
   */
  multiple?: boolean
  values?: readonly string[]
  onChangeValues?: (values: string[]) => void
  size?: 'small' | 'medium'
  variant?: 'default' | 'sorting' | 'capsule'
  /** 목록이 열리는 쪽. 화면 아래쪽에 서는 트리거(입력창 안 등)는 `up` 이라야 목록이 안 잘린다 */
  placement?: 'down' | 'up'
  disabled?: boolean
  /**
   * 트리거 안에 붙는 조건 이름 (「상태」 「문서 유형」). 이름표를 밖에 세울 자리가 없는
   * 조건 줄에서 쓴다 — 값보다 한 톤 옅게, 값 앞에 선다. 보조기술은 `aria-label` 이 읽는다
   */
  label?: string
  /** 고른 값이 목록에 없을 때만 보인다. 값이 `''` 인 항목이 있으면 그 라벨이 이긴다 */
  placeholder?: string
  className?: string
  /** 라벨을 밖(FilterPanel.Field)에서 달기 때문에 필수 */
  'aria-label': string
}) {
  const [inner, setInner] = useState(defaultValue ?? '')
  const current = value ?? inner

  /* 다중 선택의 값. 단일 선택일 때는 쓰이지 않는다 */
  const [innerValues, setInnerValues] = useState<string[]>([])
  const currentValues = useMemo(
    () => (values ? [...values] : innerValues),
    [values, innerValues],
  )

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
    () =>
      multiple
        ? /* 여럿일 때 「열면서 가리킬 자리」는 처음 고른 항목이다 */
          options.findIndex((o) => o.value !== '' && currentValues.includes(o.value))
        : options.findIndex((o) => o.value === current),
    [options, current, multiple, currentValues],
  )
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined

  /** 이 항목이 지금 켜져 있는가. 다중일 때 `''` 항목은 **아무것도 안 켰을 때** 켜진다 */
  const picked = (o: DropdownOption, i: number) =>
    multiple
      ? o.value === ''
        ? currentValues.length === 0
        : currentValues.includes(o.value)
      : i === selectedIndex

  /** 「전체」 줄을 뺀, 실제로 켤 수 있는 낱개 수 */
  const selectableCount = options.filter((o) => o.value !== '').length

  /* 트리거에 적을 글자. 이름을 모두 늘어놓으면 트리거가 옆에 선 것을 밀어내므로 **첫 이름 +
     나머지 건수**로 줄인다. 둘을 **따로** 들고 있는 까닭: 폭이 모자랄 때 끊겨야 하는 쪽은
     이름이고 건수는 끝까지 남아야 한다. 한 문장으로 만들면 말줄임이 뒤에서부터 먹어
     정작 「외 4건」이 먼저 사라진다 */
  const chosen = options.filter((o) => o.value !== '' && currentValues.includes(o.value))
  const triggerText = multiple
    ? chosen.length === 0
      ? (options.find((o) => o.value === '')?.label ?? placeholder)
      : chosen[0].label
    : (selected?.label ?? placeholder)
  const triggerCount = multiple && chosen.length > 1 ? `외 ${chosen.length - 1}건` : null
  /* 트리거는 이름 하나와 건수만 이고 나머지는 끊는다. 무엇이 걸려 있는지는 **마우스를 얹으면**
     다 보인다 — 목록을 열지 않고도 확인할 수 있어야 한다. 하나만 골랐을 때는 트리거에 이미
     그 이름이 다 적혀 있으므로 띄우지 않는다 (빈 글자면 이름표가 안 뜬다) */
  const chosenAll = multiple && chosen.length > 1 ? chosen.map((o) => o.label).join(', ') : ''

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
    if (multiple) {
      const set = new Set(currentValues)
      if (opt.value === '') set.clear()
      else if (set.has(opt.value)) set.delete(opt.value)
      else set.add(opt.value)
      /* 고른 순서가 아니라 **목록 순서**로 담는다 — 요약 글자가 고른 차례에 따라
         달라지면 같은 조건인데 트리거 글자가 매번 바뀐다 */
      const picks = options.filter((o) => o.value !== '' && set.has(o.value)).map((o) => o.value)
      /* 낱개를 다 켜면 그건 곧 **전체**다. 값을 비워 「전체」 한 줄로 접는다 —
         「전체」와 「낱개 전부」가 다른 상태로 남으면 같은 뜻을 두 모양으로 갖게 된다 */
      const next = picks.length === selectableCount ? [] : picks
      if (values === undefined) setInnerValues(next)
      onChangeValues?.(next)
      return // 닫지 않는다 — 이어서 더 고를 수 있어야 한다
    }
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
      className={cx('ratis-dropdown', className)}
      data-size={size}
      data-variant={variant}
      data-placement={placement}
      data-open={open || undefined}
    >
      {/* 이름표는 **감싼 상자**에 건다 (Tooltip 의 전제). 글자가 비면 안 뜬다 */}
      <Tooltip text={chosenAll} placement={placement === 'up' ? 'top' : 'bottom'}>
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
        {label && (
          <>
            <span className="label" aria-hidden>
              {label}
            </span>
            {/* 조건 이름과 고른 값을 가르는 가는 선. 둘 다 같은 굵기·같은 색이라 사이 여백만으로는
                「범위 전체 자료」가 한 마디로 붙어 읽힌다. 선은 있는 듯 없는 듯 둔다 —
                여기서 나눌 것은 두 덩어리이지 두 칸이 아니다 */}
            <span className="bar" aria-hidden />
          </>
        )}
        {/* 다중일 때 「아무것도 안 고름」은 빈 값이 아니라 **전체**라는 뜻이라 옅게 두지 않는다.

            ★ 트리거는 **좁게** 선다. 이름이 길면 정해진 폭까지만 늘어나고 그 뒤로는 이름을
              끊는다 — 넓게 서는 쪽은 판이다. 건수는 안 끊긴다 */}
        <span className="value" data-placeholder={multiple || selected ? undefined : true}>
          <span className="text">{triggerText}</span>
          {triggerCount && <span className="count">{triggerCount}</span>}
        </span>
        <ChevronDown aria-hidden />
      </button>
      </Tooltip>

      {/* 닫혀도 지우지 않고 `hidden` 으로 감춘다 — 트리거의 `aria-controls` 가 가리키는
          대상이 사라지면 보조기술이 관계를 잃는다 */}
      <ul
        ref={listRef}
        id={listId}
        className="list"
        role="listbox"
        aria-label={ariaLabel}
        aria-multiselectable={multiple || undefined}
        hidden={!open}
      >
        {options.map((o, i) => (
          <Fragment key={o.value}>
          {/* 「전체」와 낱개는 **다른 갈래**다 — 하나는 범위를 걷는 자리이고 나머지는 고르는
              자리다. 줄 사이 간격만으로는 안 읽혀 가는 선을 하나 긋는다 */}
          {i === 1 && options[0].value === '' && <li className="divider" role="presentation" />}
          <li
            id={optionId(i)}
            role="option"
            className="option"
            aria-selected={picked(o, i)}
            aria-disabled={o.disabled || undefined}
            data-active={i === active || undefined}
            /* 누르는 순간 트리거에서 포커스가 빠지지 않게 막는다 — activedescendant 패턴은
               포커스가 트리거에 머무는 것이 전제다 */
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => commit(i)}
            onPointerMove={() => !o.disabled && setActive(i)}
          >
            <span className="label">{o.label}</span>
            {/* 켜진 자리는 단일이든 다중이든 **같은 체크**다 (2026-09-03). 다중이라고 왼쪽에
                네모 칸을 세우면 같은 목록이 두 문법으로 갈린다 — 여러 개를 켤 수 있다는 사실은
                체크가 **여럿 서는 것**으로 읽히고, 트리거의 「A 외 n」이 한 번 더 말한다.
                ★ 체크 자리는 **늘 서 있고** 켜질 때만 보인다. 켤 때 자리가 생기면 그 줄이
                  넓어지고, 줄이 넓어지면 판 폭이 따라 바뀐다 — 고를 때마다 목록이 흔들린다 */}
            <span className="mark" aria-hidden data-on={picked(o, i) || undefined}>
              <Check />
            </span>
          </li>
          </Fragment>
        ))}
      </ul>
    </div>
  )
}
