import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SidebarToggle } from '../components/custom/SidebarToggle'

/**
 * 사이드바 접기·펼치기 (폴딩).
 *
 * **한 자리가 두 뜻을 진다.** 접기와 펼치기를 각각 두면 접힌 폭에 안 쓰는 단추가 하나 남는다.
 * 모양과 이름이 함께 바뀌고 `aria-expanded` 가 지금 상태를 말한다 — 글리프만 바뀌면
 * 눈으로 보는 사람에게만 상태가 전해진다.
 *
 * 면이 없는 보조 조작이라 캡슐이 아니라 라운드 8 이다 (design.md §3).
 */
const meta = {
  title: 'AI chat/사이드바/SidebarToggle',
  component: SidebarToggle,
  tags: ['autodocs'],
  args: { collapsed: false, onToggle: () => {}, controls: 'story-side' },
} satisfies Meta<typeof SidebarToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Expanded: Story = { name: '펼친 상태' }

export const Collapsed: Story = { name: '접힌 상태', args: { collapsed: true } }

/** 눌러서 두 상태를 오간다. 이름도 함께 바뀐다 */
function Interactive() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
      <SidebarToggle
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        controls="story-side"
      />
      <span style={{ fontSize: '1.3rem', color: 'var(--ratis-gray-60)' }}>
        {collapsed ? '접힘' : '펼침'}
      </span>
    </div>
  )
}

export const Toggling: Story = { name: '눌러 보기', render: () => <Interactive /> }
