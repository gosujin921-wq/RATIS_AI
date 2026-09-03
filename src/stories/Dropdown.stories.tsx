import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dropdown } from '../components/ui/Dropdown'

const meta = {
  title: '공통 컴포넌트/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '28rem' }}><Story /></div>],
  args: {
    'aria-label': '문서 유형',
    options: [
      { value: '', label: '전체' },
      { value: 'guide', label: '지침' },
      { value: 'process', label: '절차' },
      { value: 'standard', label: '기준' },
      { value: 'form', label: '서식' },
    ],
  },
} satisfies Meta<typeof Dropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

export const Selected: Story = { name: '고른 값 있음', args: { defaultValue: 'process' } }

export const Small: Story = { name: '작게', args: { size: 'small' } }

/**
 * 캡슐 — 칩과 한 줄에 서는 조건 줄용. 줄을 채우지 않고 고른 값 길이만큼만 선다.
 * 이름표를 밖에 세울 자리가 없으므로 `label` 로 조건 이름을 트리거 안에 붙인다.
 */
export const Capsule: Story = {
  name: '캡슐',
  decorators: [(Story) => <div style={{ display: 'flex', gap: '0.8rem' }}><Story /></div>],
  args: { variant: 'capsule', size: 'small', label: '문서 유형', defaultValue: '' },
}

/**
 * 다중 선택 — 갈래를 겹쳐 켜는 조건 (챗봇 검색 범위). 항목마다 네모 칸이 서고, 골라도
 * 목록이 닫히지 않는다. 값이 `''` 인 항목은 모두 해제하는 자리라 아무것도 안 골랐을 때 켜진다.
 */
export const Multiple: Story = {
  name: '다중 선택',
  args: { multiple: true },
}

/** 화면 아래쪽(입력창 안 등)에 서는 트리거 — 목록이 잘리지 않게 위로 펼친다 */
export const PlacementUp: Story = {
  name: '위로 펼치기',
  decorators: [(Story) => <div style={{ paddingTop: '24rem' }}><Story /></div>],
  args: { placement: 'up' },
}

export const Disabled: Story = { name: '잠김', args: { disabled: true } }

/** 못 고르는 낱개가 섞인 목록. 지우는 대신 잠가서 앞으로 생길 갈래를 남긴다 */
export const WithDisabledOption: Story = {
  name: '잠긴 항목 포함',
  args: {
    options: [
      { value: 'doc', label: '문서' },
      { value: 'table', label: '표' },
      { value: 'image', label: '이미지 (준비 중)', disabled: true },
    ],
  },
}

/** 목록이 길 때 — 값 자체보다 고른 결과가 중요한 자리는 라디오 대신 드롭다운으로 접는다 */
export const LongList: Story = {
  name: '긴 목록',
  args: {
    'aria-label': '갱신 연도',
    options: Array.from({ length: 12 }, (_, i) => ({
      value: String(2026 - i),
      label: `${2026 - i}년`,
    })),
  },
}
