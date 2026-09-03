import type { Meta, StoryObj } from '@storybook/react-vite'
import { SkipLink } from '../components/ui/SkipLink'

/**
 * 본문 바로가기 — 키보드로 들어온 사람이 사이드바 스무 줄을 지나치지 않게 첫 초점에서
 * 본문으로 건너뛰는 길.
 *
 * ★ **평소에는 안 보이고 초점이 닿을 때만 선다.** `display: none` 으로 감추면 초점 자체가
 *   가지 않아 있으나 마나가 된다 — 화면 밖으로 밀어 두었다가 초점에서 끌어온다.
 *
 * 아래 상자를 클릭한 뒤 **Tab** 을 눌러 보면 왼쪽 위에 나타난다.
 */
const meta = {
  title: '공통 컴포넌트/SkipLink',
  component: SkipLink,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '12rem', paddingTop: '5rem' }}>
        <Story />
        <p style={{ fontSize: 'var(--ratis-font-sm)', color: 'var(--ratis-text-subtle)' }}>
          여기를 누른 뒤 Tab 을 누르면 왼쪽 위에 링크가 나타난다.
        </p>
      </div>
    ),
  ],
  args: { targetId: 'main', children: '본문 바로가기' },
} satisfies Meta<typeof SkipLink>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }
