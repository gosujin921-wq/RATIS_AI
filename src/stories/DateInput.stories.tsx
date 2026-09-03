import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateInput } from '../components/ui/DateInput'

const meta = {
  title: '공통 컴포넌트/DateInput',
  component: DateInput,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '28rem', paddingBottom: '38rem' }}><Story /></div>],
  args: { label: '공개 시작일' },
} satisfies Meta<typeof DateInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

export const Filled: Story = { name: '값 있음', args: { defaultValue: '2026.09.03' } }

export const WithHelp: Story = {
  name: '도움말',
  args: { help: '비우면 상시 공개됩니다.', placeholder: '비우면 상시 공개' },
}

export const Invalid: Story = {
  name: '오류',
  args: { defaultValue: '2026.13.40', error: '없는 날짜입니다. 다시 확인해 주세요.' },
}

/** 조건 줄 — 이름표를 세울 자리가 없어 aria-label 로만 이름을 준다 */
export const Compact: Story = {
  name: '조건 줄',
  args: { label: undefined, 'aria-label': '기준일', size: 'small', defaultValue: '2026.09.02' },
}
