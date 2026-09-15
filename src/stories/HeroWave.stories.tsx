import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeroWave } from '../components/custom/HeroWave'

/**
 * 시작 화면 심볼 — 방사선 파동 + 각 분야 도달 (2026-09-14 협회 의견 반영).
 *
 * 중심 코어에서 파동 링이 바깥으로 넓어지며 사라지고, 링이 닿는 순간 바깥 분야점(틸)이
 * 차례로 켜진다. 한 바퀴 3.6초. 움직임을 줄인 화면에서는 링이 멈춘 채 선다.
 *
 * ★ 캔버스가 아니라 SVG + CSS 다. 크기는 부모가 정한다 (여기서는 24rem).
 */
const meta = {
  title: 'AI chat/대화/HeroWave',
  component: HeroWave,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: '24rem', height: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeroWave>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본 (3.6초 루프)' }
