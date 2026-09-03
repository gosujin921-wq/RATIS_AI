import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateRangeFilter } from '../components/custom/DateRangeFilter'

const meta = {
  title: '공통 컴포넌트/DateRangeFilter',
  component: DateRangeFilter,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ paddingBottom: '46rem' }}><Story /></div>],
} satisfies Meta<typeof DateRangeFilter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

/** 걸린 기간은 칩 라벨이 된다. 옆에 지우는 길이 함께 선다 */
export const Picked: Story = {
  name: '기간 걸림',
  args: { defaultValue: { start: '2026.08.01', end: '2026.08.31' } },
}

/** 줄 오른쪽 끝에 서는 칩 — 카드를 오른쪽에 맞춘다 */
export const AlignEnd: Story = {
  name: '오른쪽 맞춤',
  decorators: [(Story) => <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '46rem' }}><Story /></div>],
  args: { align: 'end' },
}

export const Small: Story = { name: '작게', args: { size: 'sm' } }
