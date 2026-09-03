import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pagination } from '../components/ui/Pagination'

const meta = {
  title: '공통 컴포넌트/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: { totalPages: 13, defaultPage: 7 },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

/** 첫 쪽 — 이전이 흐려지되 자리는 지킨다 (사라지면 줄이 좌우로 흔들린다) */
export const First: Story = { name: '첫 쪽', args: { defaultPage: 1 } }

/** 좁은 화면 — 지금 쪽만 남긴다. 실제로는 PageNav 가 폭을 보고 정한다 */
export const Narrow: Story = { name: '좁은 화면', args: { siblingCount: 0 } }

/** 말줄임이 한 쪽만 감출 자리에는 그 숫자를 그대로 세운다 */
export const Short: Story = { name: '쪽수 적음', args: { totalPages: 5, defaultPage: 3 } }
