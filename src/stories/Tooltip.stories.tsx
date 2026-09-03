import type { Meta, StoryObj } from '@storybook/react-vite'
import { PencilLine, Trash2 } from 'lucide-react'
import { Tooltip } from '../components/ui/Tooltip'
import { IconButton } from '../components/custom/IconButton'

const meta = {
  title: '공통 컴포넌트/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ padding: '6rem 2rem 2rem' }}><Story /></div>],
  args: { text: '수정', children: <IconButton aria-label="수정"><PencilLine aria-hidden /></IconButton> },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

/** 표 마지막 열의 행 조작 — 글자를 세울 자리가 없는 곳에서만 쓴다 */
export const RowActions: Story = {
  name: '행 조작',
  render: () => (
    <div style={{ display: 'flex', gap: '0.4rem' }}>
      <Tooltip text="수정">
        <IconButton aria-label="수정"><PencilLine aria-hidden /></IconButton>
      </Tooltip>
      <Tooltip text="삭제">
        <IconButton tone="danger" aria-label="삭제"><Trash2 aria-hidden /></IconButton>
      </Tooltip>
    </div>
  ),
}

/** 위가 막힌 자리는 아래로 */
export const Bottom: Story = { name: '아래로', args: { placement: 'bottom' } }
