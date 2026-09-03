import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ConversationSummary, Me } from '../api/types'
import { Sidebar } from '../components/custom/Sidebar'

/**
 * 사이드바 — **부품을 모아 세우는 판.**
 *
 * BrandLogo · SidebarToggle · SideRow · ConversationList · UserMenu 가 여기서 만난다.
 * 부품은 제 모양만 알고, 어디에 서는지와 접히면 어떻게 되는지는 이 판이 안다.
 *
 * 폭에 따라 서는 방식이 갈린다.
 *   넓은 화면   제자리에 선다. 접으면 아이콘 레일(7.2rem)로 줄어든다
 *   좁은 화면   서랍으로 들어간다 (가림막과 여는 단추는 셸이 진다)
 *
 * 접힘은 통째로 숨기는 것이 아니다. 숨기면 새 대화로 가는 길까지 사라져 매번 펼쳤다
 * 접어야 한다. 레일에는 조작 줄 둘과 고정·최근 목록을 여는 단추가 남는다.
 */
const DAY = 24 * 60 * 60 * 1000
const ago = (days: number, h = 14, m = 0) => {
  const d = new Date(Date.now() - days * DAY)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

const ME: Me = { displayName: '김방사', role: 'ASSOC' }

const CONVERSATIONS: ConversationSummary[] = [
  { conversationId: 'p1', title: '방사선산업 실태조사 총괄 요약', lastConversedAt: ago(0, 11, 20), pinned: true },
  { conversationId: 'p2', title: '종사자 수 5년 추이', lastConversedAt: ago(41, 15, 5), pinned: true },
  { conversationId: 'c1', title: '2024년 이용기관 수 변화', lastConversedAt: ago(0, 17, 20) },
  { conversationId: 'c2', title: '비파괴검사 분야 종사자 현황', lastConversedAt: ago(0, 10, 5) },
  { conversationId: 'c3', title: '방사선 이용기관 지역별 분포', lastConversedAt: ago(1, 16, 40) },
  { conversationId: 'c4', title: null, lastConversedAt: ago(1, 9, 15) },
  { conversationId: 'c5', title: '의료기관 방사선 장비 보유 추이', lastConversedAt: ago(3, 14, 30) },
]

const meta = {
  title: 'AI chat/사이드바/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  /* 셸 안에서처럼 높이를 가진 가로 칸에 세운다 — 목록이 남는 높이를 먹는 구조라
     높이가 없으면 판이 내용만큼만 서서 제 모양이 안 나온다 */
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: '64rem' }}>
        <Story />
        <div style={{ flex: 1 }} />
      </div>
    ),
  ],
  args: { me: ME, conversations: CONVERSATIONS, activeConversationId: 'c1' },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

/** 접으면 아이콘 레일이 된다. 핀·말풍선 단추가 고정·최근 목록을 옆으로 편다 */
export const Collapsed: Story = { name: '접힘 (레일)', args: { collapsed: true } }

/** 관리자에게만 사용자 메뉴에 「관리자 페이지」가 선다 */
export const Admin: Story = {
  name: '관리자',
  args: { me: { displayName: '이관리', role: 'ADMIN' } },
}

/** 아직 대화가 없는 상태. 목록 자리에 안내 한 줄만 남는다 */
export const Empty: Story = { name: '대화 없음', args: { conversations: [] } }
