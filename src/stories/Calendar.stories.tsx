import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Calendar, type CalendarRange } from '../components/ui/Calendar'

const meta = {
  title: '공통 컴포넌트/Calendar',
  component: Calendar,
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  name: '하루',
  render: () => {
    const [value, setValue] = useState('2026.09.03')
    return <Calendar value={value} onSelect={setValue} />
  },
}

/** 첫 누름이 시작, 두 번째가 끝. 거꾸로 골라도 뒤집어 담는다 */
export const Range: Story = {
  name: '기간',
  render: () => {
    const [range, setRange] = useState<CalendarRange>({ start: '2026.09.03', end: '2026.09.17' })
    return <Calendar mode="range" range={range} onSelectRange={setRange} />
  },
}
