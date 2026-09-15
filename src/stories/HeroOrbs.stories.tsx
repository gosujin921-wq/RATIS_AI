import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeroOrbs } from '../components/custom/HeroOrbs'

/**
 * 시작 화면 심볼 둘째 타입 — 유리 구슬이 터져 퍼졌다가 링으로 모인다 (docs/mov2.mov 실측).
 *
 * 가운데 흰 유리구슬 하나. 색 구슬 여섯이 양옆으로 터져 흩어지고, 하나는 오른쪽 아래로 크게
 * 다가온다. 잠시 떠돌다 알약 조각으로 늘어나 가운데 둘레의 링으로 모여 닫히고, 중심으로 빨려
 * 들어가 다시 터진다. 한 바퀴 3.3초 (영상 1.65초의 두 배 박자, 구간 비율은 같다).
 * 움직임을 줄인 화면에서는 링이 닫힌 그림 한 장.
 *
 * ★ 무대(어두운 남색 면)가 컴포넌트 안에 있다. 크기는 부모가 정한다 (여기서는 24rem).
 */
const meta = {
  title: 'AI chat/대화/HeroOrbs',
  component: HeroOrbs,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: '24rem', height: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeroOrbs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본 (3.3초 루프)' }

export const Wide: Story = {
  name: '넓은 무대 (영상 비율 480×308)',
  decorators: [
    (Story) => (
      <div style={{ width: '48rem', height: '30.8rem' }}>
        <Story />
      </div>
    ),
  ],
}
