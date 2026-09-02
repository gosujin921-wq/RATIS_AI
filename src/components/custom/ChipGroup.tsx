import type { ComponentProps, ReactNode } from 'react'
import { Button, CheckboxChip, CheckboxGroup, RadioChip, RadioGroup } from 'krds-react'
import { cx } from './util'
import './ChipGroup.css'

/** 킷 1.1.1 타입에 children 이 빠져 있다. 런타임은 children 을 라벨로 렌더한다 */
const RChip = RadioChip as unknown as (
  p: ComponentProps<typeof RadioChip> & { children?: ReactNode },
) => ReactNode
const CChip = CheckboxChip as unknown as (
  p: ComponentProps<typeof CheckboxChip> & { children?: ReactNode },
) => ReactNode

export interface ChipOption<T extends string> {
  value: T
  label: string
  /** 라벨 앞 아이콘. 색은 아이콘이 스스로 정한다 (EventTypeIcon 등) */
  icon?: ReactNode
  /**
   * 못 고르는 낱개 (2026-08-21 추가 — 생성형 AI 의 `이미지 기반 (준비 중)`).
   * **지우는 대신 잠그는 자리**를 위한 값이다: 목록에서 빼면 앞으로 생길 갈래가 있다는 사실까지
   * 사라진다. 잠근 낱개에는 왜 못 고르는지를 라벨에 함께 적는다 — 회색으로만 두면 고장으로 읽힌다.
   */
  disabled?: boolean
  /**
   * 낱개에 마우스를 얹었을 때 뜨는 **한 마디** (2026-08-24 추가 — 생성형 AI 의 `준비 중`).
   * 못 고르는 낱개의 사정처럼 **이름에 넣으면 이름이 길어지는 말**을 여기로 뺀다.
   * 보조기술은 이 말도 낱개 이름의 일부로 읽는다 (`aria-hidden` 을 걸지 않는다) — 마우스가
   * 없으면 못 보는 자리에 사정을 숨겨 두면, 왜 못 고르는지를 그쪽에서만 알 수 없게 된다.
   * ※ `look='tile'` 의 단일선택 갈래만 그린다. 다른 갈래에 필요해지면 그때 자리를 만든다.
   */
  note?: string
}

/**
 * 칩 묶음 — 조건을 고르는 캡슐 줄. 한 곳에서 조립해 화면마다 어긋나지 않게 한다.
 *
 * 모양이 곧 뜻이다 (design.md §4):
 *   single  붙인 세그먼트 한 덩어리 — 하나만 켜진다
 *   multi   낱개로 흩어진 칩 — 여러 개 켤 수 있다
 * 미선택 상태에서도 몇 개를 고를 수 있는지 모양으로 알 수 있다.
 *
 * 손으로 조립하면 매번 놓치는 것들을 안에 가둔다.
 *   · 킷 타입에 children 이 없어 필요한 캐스팅
 *   · `CheckboxChip` 은 id 를 안 주면 label for 가 비어 칩이 죽는다 (RadioChip 과 달리 자동 생성 안 함)
 *   · role="group" + aria-label (소제목을 달지 않는 영역이라 이름이 필요하다)
 *   · 체크(✓) 표식 끄기 — 선택은 채움·틴트로 구분한다
 */
export function ChipGroup<T extends string>({
  label,
  name,
  options,
  size = 'medium',
  look = 'chip',
  className,
  ...rest
}: {
  /** 보조기술이 읽을 묶음 이름 */
  label: string
  /** 라디오 묶음 이름. single 일 때만 쓰인다 */
  name?: string
  options: readonly ChipOption<T>[]
  size?: 'small' | 'medium' | 'large'
  /**
   * 낱개를 무엇으로 그릴지 (2026-08-07 화면 검토로 추가).
   *   chip    킷 칩 — 기본
   *   button  킷 버튼 토글 — 켜짐은 칩과 같은 틴트, 꺼짐은 흰 면. `multi` 에서만 쓴다
   *   tile    **그림 위 · 이름 아래**로 세운 네모 타일 (2026-08-21 추가, 화면 검토 지시).
   *           값이 여럿이고 **낱개마다 그림이 있는** 축에 쓴다 — 글자만 있는 칩 줄에서는
   *           스물이 넘는 낱개가 길이만 다른 캡슐로 늘어서 훑기가 안 되는데, 그림이 붙으면
   *           읽기 전에 골라진다. 그림이 없는 축에는 쓰지 말 것 (빈 타일이 된다).
   *           격자로 서므로 낱개 폭이 고르고 줄 오른쪽 끝이 맞는다. `multi` 에서만 쓴다
   *   radio   **라디오 표식을 단 칩** (2026-08-21 추가, 화면 검토 지시). 낱개 칩 모양인데
   *           한 축에 하나만 켜지는 자리에 쓴다.
   *           §4 는 「낱개로 흩어진 칩 = 여러 개 켤 수 있다」로 모양과 뜻을 묶어 두었다.
   *           그 규칙을 깨지 않으면서 낱개 칩을 쓰려면 **모양에 단서를 하나 더 얹어야** 한다 —
   *           캡슐 **바깥** 앞에 라디오 원을 세운다. 바깥에 두면 캡슐 자체는 다중선택 칩과
   *           똑같은 물건으로 남고, 원 하나가 「이 줄은 하나만 켜진다」고 덧붙인다. 라디오는 「목록 중 하나」를 뜻하는 표식이라,
   *           같은 캡슐이어도 체크(✓)를 단 다중선택 칩과 첫눈에 갈린다.
   *           ※ 실제 조작은 누름 토글이다 (켜진 것을 다시 누르면 꺼진다) — 이 축들은 비워 둘 수
   *             있어야 하는데 진짜 라디오에는 끄는 자리가 없다. 원은 「하나만」을 말하는 모양이고,
   *             「다시 누르면 해제된다」는 사실은 화면이 글로 함께 적는다.
   *           ★ design.md §4 보완이 필요하다 — 칩 표에 이 갈래가 아직 없다. `multi` 에서만 쓴다
   *
   * ★ `button` 은 아직 **학습데이터 검색 한 화면 전용**이다 (2026-08-07). 다른 화면의 조건 줄은
   * 칩(기본값)으로 두고, 넓힐지는 그 화면을 잡을 때 다시 본다 — design.md §3 토글 버튼 갈래에도
   * 같은 단서를 달아 뒀다.
   *
   * ★ 정본과 어긋난 자리 — SCREEN-004 는 재난유형을 `Checkbox`(다중선택 칩), 계절·월도 `Checkbox`
   * 로 규정한다. 버튼 토글로 세운 것은 화면 검토 결정(2026-08-07)이며 SCREEN-004 보완이 필요하다.
   * 고르는 값과 보내는 값은 그대로라 API 계약(API-020 eventType·months)은 바뀌지 않는다.
   * 되돌리려면 화면에서 `look` 만 떼면 된다.
   */
  look?: 'chip' | 'button' | 'tile' | 'radio'
  className?: string
} & (
  | { single: true; value: T; onChange: (next: T) => void }
  | { single?: false; value: readonly T[]; onChange: (next: T[]) => void }
)) {
  /**
   * 타일 — 그림 위 · 이름 아래. **하나만 켜지는 갈래와 여럿 켜지는 갈래가 부품이 다르다.**
   *
   * 하나만 켜지는 쪽(`single`)은 **맨 라디오**로 세운다. 값이 반드시 하나 있어야 하는 축이라
   * 「지금 켠 것을 끄는」 조작이 없고, 그건 라디오가 뜻하는 바 그대로다 — 보조기술이 「2개 중
   * 1번째」로 읽고 화살표로 옮겨 다닐 수 있다. 버튼에 `aria-pressed` 를 달면 낱개마다 켜짐·꺼짐이
   * 따로 있는 것으로 읽혀, 필수 축인데 둘 다 끌 수 있는 것처럼 들린다.
   * 라디오는 눈에서 지우되 지우지 않는다(화면 밖으로 밀어낸다) — `display:none` 으로 없애면
   * 키보드 초점이 사라져 탭으로 못 고른다.
   *
   * 여럿 켜지는 쪽은 아래 `look === 'tile'` 갈래에서 버튼 + `aria-pressed` 로 세운다.
   * 켜진 것을 다시 눌러 끄는 조작이 있어야 하는데 라디오에는 그 자리가 없다.
   */
  if (rest.single && look === 'tile') {
    const { value, onChange } = rest
    const group = name ?? label
    return (
      <div className={cx('klid-chip-group klid-tile-group', className)} role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <label key={o.value} className="klid-tile">
            <input
              type="radio"
              className="klid-tile-input"
              name={group}
              value={o.value}
              checked={value === o.value}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
            />
            {o.icon}
            <span className="name">{o.label}</span>
            {o.note && <span className="klid-chip-tip">{o.note}</span>}
          </label>
        ))}
      </div>
    )
  }

  if (rest.single) {
    const { value, onChange } = rest
    return (
      <div className={cx('klid-chip-group klid-segment', className)} role="group" aria-label={label}>
        <RadioGroup name={name ?? label} value={value} onChange={(v) => onChange(v as T)}>
          {options.map((o) => (
            <RChip key={o.value} value={o.value} size={size} disabled={o.disabled}>
              {o.icon}
              {o.label}
            </RChip>
          ))}
        </RadioGroup>
      </div>
    )
  }

  const { value, onChange } = rest
  const toggle = (v: T) => (value.includes(v) ? value.filter((x) => x !== v) : [...value, v])

  /**
   * 버튼 토글. 칩은 checkbox 라 켜짐이 `checked` 로 전해지지만, 버튼에는 그 자리가 없다 —
   * `aria-pressed` 로 눌린 상태를 말한다 (보조기술이 "선택됨"으로 읽는다). 켜짐 색이 틴트라
   * 명도차가 작으므로, 상태를 속성으로도 남기는 것이 색각 접근성 장치가 된다.
   *
   * 변형은 켜짐·꺼짐 모두 tertiary 한 벌이고 켜진 것만 CSS 가 틴트로 물들인다 (ChipGroup.css).
   * primary 채움을 쓰지 않는 이유 — 이 패널에서 채움은 `검색` 하나가 쓰는 무게다 (design.md §3).
   * 조건 토글이 같은 채움을 쓰면 여럿 켰을 때 무엇이 실행 버튼인지 흐려진다.
   */
  /**
   * 라디오 표식을 단 칩. 타일과 같은 이유로 맨 요소다 — 킷 칩은 라벨 안이 글자 한 줄인 전제라
   * 원·그림·이름 셋이 설 자리가 없고, `aria-pressed` 로 눌린 상태를 말해야 하는데 킷 칩은
   * checkbox 라 그 자리가 없다.
   * 원은 `<span>` 으로 그린다 — 진짜 라디오를 넣으면 「끌 수 없다」는 뜻이 함께 따라온다.
   */
  if (look === 'radio') {
    return (
      <div className={cx('klid-chip-group klid-radio-chip-group', className)} role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="klid-radio-chip"
            aria-pressed={value.includes(o.value)}
            disabled={o.disabled}
            onClick={() => onChange(toggle(o.value))}
          >
            <span className="dot" aria-hidden />
            <span className="cap">
              {o.icon}
              <span className="name">{o.label}</span>
            </span>
          </button>
        ))}
      </div>
    )
  }

  /** 여럿 켜지는 타일 — 켜진 것을 다시 눌러 끈다. 그 조작이 있어야 해서 버튼으로 세운다 */
  if (look === 'tile') {
    return (
      <div className={cx('klid-chip-group klid-tile-group', className)} role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="klid-tile"
            aria-pressed={value.includes(o.value)}
            disabled={o.disabled}
            onClick={() => onChange(toggle(o.value))}
          >
            {o.icon}
            <span className="name">{o.label}</span>
          </button>
        ))}
      </div>
    )
  }

  if (look === 'button') {
    return (
      <div className={cx('klid-chip-group klid-chip-group-button', className)} role="group" aria-label={label}>
        {options.map((o) => {
          const on = value.includes(o.value)
          return (
            <Button
              key={o.value}
              type="button"
              size="small"
              variant="tertiary"
              disabled={o.disabled}
              aria-pressed={on}
              onClick={() => onChange(toggle(o.value))}
            >
              {o.icon}
              {o.label}
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cx('klid-chip-group klid-chip-no-check', className)} role="group" aria-label={label}>
      <CheckboxGroup>
        {options.map((o) => (
          <CChip
            key={o.value}
            id={`${name ?? label}-${o.value}`}
            value={o.value}
            size={size}
            disabled={o.disabled}
            checked={value.includes(o.value)}
            onChange={() => onChange(toggle(o.value))}
          >
            {o.icon}
            {o.label}
          </CChip>
        ))}
      </CheckboxGroup>
    </div>
  )
}
