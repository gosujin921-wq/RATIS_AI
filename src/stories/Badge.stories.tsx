import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '../components/ui/Badge'

const meta = {
  title: '공통 컴포넌트/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: '답변완료' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

const TONES = ['gray', 'brand', 'info', 'success', 'warning', 'danger'] as const

export const Default: Story = { name: '기본' }

/** 글자는 어느 tone 이든 먹색이다 — 표를 세로로 훑을 때 색은 곁눈으로만 들어온다 */
export const Tones: Story = {
  name: '갈래별 면',
  render: () => (
    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
      {TONES.map((t) => (
        <Badge key={t} tone={t}>
          {t}
        </Badge>
      ))}
    </div>
  ),
}

/** 무게 — tint 기본 · solid 는 화면에 하나뿐인 지금 상태 · outline 은 아직 아무것도 아님 */
export const Variants: Story = {
  name: '무게',
  render: () => (
    <div style={{ display: 'flex', gap: '0.8rem' }}>
      <Badge tone="success" variant="tint">tint</Badge>
      <Badge tone="success" variant="solid">solid</Badge>
      <Badge tone="success" variant="outline">outline</Badge>
    </div>
  ),
}

/** 상태는 캡슐, 갈래는 각진 태그. 색이 아니라 모양으로 갈린다 */
export const Shapes: Story = {
  name: '모양',
  render: () => (
    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
      <Badge tone="warning">답변대기</Badge>
      <Badge tone="gray" shape="square">이용문의</Badge>
      <Badge tone="gray" shape="square" size="md">이용문의</Badge>
    </div>
  ),
}
