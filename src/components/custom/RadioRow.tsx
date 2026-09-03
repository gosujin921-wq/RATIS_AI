import { ChoiceGroup, type ChoiceSize } from '../ui/Checkbox'
import { Radio } from '../ui/Radio'

/**
 * 단일선택 조건 한 줄 — 선택지를 접지 않고 **바닥에 펴서** 라디오로 받는다.
 *
 * 언제 이걸 쓰나 (design.md §4 「모양이 곧 뜻이다」의 세 갈래):
 *   · 채움 세그먼트(ChipGroup) — 갈래가 둘·셋이고 **서로 대등**할 때. 붙어 있는 모양이
 *     하나만 켜진다고 말한다.
 *   · 라디오 줄(이것) — 선택지에 `전체`·`선택 안 함` 처럼 **조건을 안 거는 상태가 섞여**
 *     있거나, 갈래가 넷 이상이라 세그먼트로 붙이면 한 덩어리가 화면 폭을 가로지를 때.
 *     세그먼트는 갈래가 대등하다고 말하는 모양이라 `전체` 가 나머지와 같은 값처럼 읽히는데,
 *     라디오는 목록 중 하나를 고르는 모양이라 그 자리가 기본값으로 자연스럽게 앉는다.
 *   · 드롭다운 — 값이 열 개를 넘거나(연도·지역) 값 자체보다 고른 결과가 중요할 때.
 *
 * 소제목을 달지 않는 자리라 묶음에 이름을 준다 — 이름이 없으면 보조기술이 낱개만 읽고
 * 「무엇을 고르는 중인지」를 말하지 못한다.
 *
 * 못 고르는 낱개는 `disabled` 로 남긴다. 아직 열리지 않은 선택지를 **지우지 않고** 두는
 * 방식이다 — 지우면 앞으로 생길 기능이 있다는 사실까지 사라지므로, 사정을 이름에 함께
 * 적고 잠근다 (「이미지 기반 영상 (준비 중)」).
 */
export function RadioRow<T extends string>({
  label,
  name,
  value,
  onChange,
  options,
  size = 'small',
  className,
}: {
  /** 묶음 이름. 화면에도 서고 보조기술도 읽는다 */
  label: string
  /** 라디오 묶음 이름(name 속성). 한 화면에서 겹치면 두 묶음이 한 묶음이 된다 */
  name: string
  value: T
  onChange: (next: T) => void
  options: readonly { value: T; label: string; disabled?: boolean }[]
  /** 밀집한 조건 패널은 small — 그 패널의 라벨·칩·입력(14)과 한 급으로 맞춘다 */
  size?: ChoiceSize
  className?: string
}) {
  return (
    <ChoiceGroup legend={label} className={className}>
      {options.map((o) => (
        <Radio
          key={o.value}
          name={name}
          size={size}
          value={o.value}
          checked={value === o.value}
          disabled={o.disabled}
          onChange={() => onChange(o.value)}
        >
          {o.label}
        </Radio>
      ))}
    </ChoiceGroup>
  )
}
