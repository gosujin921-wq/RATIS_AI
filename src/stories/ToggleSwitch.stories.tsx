import type { Meta, StoryObj } from '@storybook/react-vite'
import { ToggleSwitch } from '../components/ui/ToggleSwitch'

const meta = {
  title: '공통 컴포넌트/ToggleSwitch',
  component: ToggleSwitch,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '32rem' }}><Story /></div>],
} satisfies Meta<typeof ToggleSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본', args: { label: '상단 고정' } }

export const On: Story = { name: '켜짐', args: { label: '팝업 표시', defaultChecked: true } }

/** 켜면 무슨 일이 생기는지 한 줄 */
export const WithDescription: Story = {
  name: '설명 있음',
  args: { label: '노출', description: '끄면 공개 화면 목록에서 빠집니다.', defaultChecked: true },
}

/** 표 셀 안 — 이름표 없이 스위치만. 이때는 aria-label 이 필수다 */
export const Standalone: Story = {
  name: '홀로',
  args: { 'aria-label': '추천 검색조건 노출', defaultChecked: true },
}

export const Disabled: Story = {
  name: '잠김',
  args: { label: '상단 고정', disabled: true, description: '이미 3건이 고정돼 있습니다.' },
}
