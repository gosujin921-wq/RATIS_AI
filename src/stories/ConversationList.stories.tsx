import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ConversationSummary } from '../api/types'
import { ConversationList } from '../components/custom/ConversationList'

/**
 * 이전 대화 목록. 사이드바에서 지난 대화를 골라 여는 줄 묶음.
 *
 * 묶음은 **고정됨 · 오늘 · 지난 대화** 셋뿐이다. 어제·지난 7일·지난 30일까지 나누면
 * 열두 건짜리 목록에 묶음 제목이 여섯 줄 섞여 제목보다 이름표가 더 눈에 띈다.
 *
 * 고정과 나머지는 **상한도 「더 보기」도 따로 센다** (고정 5건 · 나머지 8건).
 * 둘을 한 상한으로 묶으면 고정을 여섯 개 해 둔 사람에게 최근 대화가 한 줄도 안 남는다.
 *
 * 시각은 줄마다 적지 않고 묶음 제목으로 올린다 — 고를 때 보는 것은 제목이다.
 */
const DAY = 24 * 60 * 60 * 1000
const ago = (days: number, h = 14, m = 0) => {
  const d = new Date(Date.now() - days * DAY)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

const CONVERSATIONS: ConversationSummary[] = [
  { conversationId: 'p1', title: '방사선산업 실태조사 총괄 요약', lastConversedAt: ago(0, 11, 20), pinned: true },
  { conversationId: 'p2', title: '종사자 수 5년 추이', lastConversedAt: ago(41, 15, 5), pinned: true },
  { conversationId: 'p3', title: '방사선 안전관리자 선임 기준 정리', lastConversedAt: ago(2, 9, 30), pinned: true },
  { conversationId: 'p4', title: '연도별 매출액 추이 비교', lastConversedAt: ago(9, 17, 5), pinned: true },
  { conversationId: 'p5', title: '실태조사 조사 항목 목록', lastConversedAt: ago(20, 11, 15), pinned: true },
  { conversationId: 'p6', title: '의료기관 장비 분류 기준', lastConversedAt: ago(33, 14, 45), pinned: true },
  { conversationId: 'c1', title: '2024년 이용기관 수 변화', lastConversedAt: ago(0, 17, 20) },
  { conversationId: 'c2', title: '비파괴검사 분야 종사자 현황', lastConversedAt: ago(0, 10, 5) },
  { conversationId: 'c3', title: '방사선 이용기관 지역별 분포', lastConversedAt: ago(1, 16, 40) },
  { conversationId: 'c4', title: null, lastConversedAt: ago(1, 9, 15) },
  { conversationId: 'c5', title: '의료기관 방사선 장비 보유 추이', lastConversedAt: ago(3, 14, 30) },
  { conversationId: 'c6', title: '방사성동위원소 수입 실적', lastConversedAt: ago(5, 11, 48) },
  { conversationId: 'c7', title: '산업체 안전관리자 배치 기준', lastConversedAt: ago(12, 13, 2) },
  { conversationId: 'c8', title: '연구기관 방사선 이용 분야별 비중', lastConversedAt: ago(24, 10, 26) },
  { conversationId: 'c9', title: '방사선 관련 매출액 규모', lastConversedAt: ago(58, 16, 10) },
  { conversationId: 'c10', title: '실태조사 표본 설계 방법', lastConversedAt: ago(112, 9, 40) },
]

const meta = {
  title: 'AI chat/사이드바/ConversationList',
  component: ConversationList,
  tags: ['autodocs'],
  /* 사이드바 폭에서만 제 모양이 보인다. 줄임표·핀·줄 메뉴가 그 폭을 전제로 선다 */
  decorators: [
    (Story) => (
      <div
        style={{
          width: '26rem',
          height: '58rem',
          display: 'flex',
          background: 'var(--ratis-gray-5)',
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: { conversations: CONVERSATIONS },
} satisfies Meta<typeof ConversationList>

export default meta
type Story = StoryObj<typeof meta>

/** 고르고 · 고정하고 · 지우는 흐름이 모두 도는 상태 */
function Interactive({ items }: { items: ConversationSummary[] }) {
  const [list, setList] = useState(items)
  const [active, setActive] = useState<string | null>('c1')
  return (
    <ConversationList
      conversations={list}
      activeId={active}
      onSelect={setActive}
      onTogglePin={(id) =>
        setList((prev) => prev.map((c) => (c.conversationId === id ? { ...c, pinned: !c.pinned } : c)))
      }
      onDelete={(id) => setList((prev) => prev.filter((c) => c.conversationId !== id))}
    />
  )
}

export const Default: Story = {
  name: '기본 (고정 · 오늘 · 지난 대화)',
  render: () => <Interactive items={CONVERSATIONS} />,
}

/** 상한에 걸리지 않는 짧은 목록. 「더 보기」가 서지 않는다 */
export const Short: Story = {
  name: '짧은 목록',
  render: () => <Interactive items={CONVERSATIONS.slice(6, 10)} />,
}

/** 아직 대화가 없을 때와 검색 결과가 없을 때는 **다른 말**이다 */
export const Empty: Story = {
  name: '대화 없음',
  args: { conversations: [] },
}

export const NoSearchResult: Story = {
  name: '검색 결과 없음',
  args: { conversations: [], emptyText: '검색 결과가 없습니다.' },
}
