import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { RadioRow } from '../components/custom/RadioRow'

const meta = {
  title: '공통 컴포넌트/RadioRow',
  component: RadioRow,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '40rem' }}><Story /></div>],
  args: { label: '데이터 유형', name: 'data-kind', value: 'ALL', onChange: () => {}, options: [] },
} satisfies Meta<typeof RadioRow>

export default meta
type Story = StoryObj<typeof meta>

const OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'IMAGE', label: '이미지' },
  { value: 'VIDEO', label: '영상' },
  { value: 'MIXED', label: '이미지 기반 영상 (준비 중)', disabled: true },
]

export const Default: Story = {
  name: '기본',
  render: () => {
    const [value, setValue] = useState('ALL')
    return <RadioRow label="데이터 유형" name="data-kind" value={value} onChange={setValue} options={OPTIONS} />
  },
}
