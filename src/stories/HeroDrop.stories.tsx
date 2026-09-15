import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeroDrop } from '../components/custom/HeroDrop'

/**
 * 시작 화면 심볼 셋째 타입 — 씨앗이 링이 되고, 방울이 떠올라 중심이 되고, 링이 돌다 흩어진다
 * (docs/mov.mov 60fps 실측).
 *
 * 작은 점이 아래로 가라앉아 링으로 펴지고, 링 바닥에 고인 빛이 방울로 떨어져 나와 중심까지
 * 떠올라 코어가 된다. 링은 대각 축으로 빠르게 돌다(잔상) 되감기며 걷히고, 코어는 씨앗으로
 * 잦아든다. 한 바퀴 3.6초(영상 그대로 · 첫 타입과 같은 박자).
 * 움직임을 줄인 화면에서는 링이 닫히고 코어가 가운데 선 그림 한 장.
 *
 * ★ 무대(어두운 박스)가 없다 — 밝은 바닥 위에 바로 선다. 크기는 부모가 정한다 (여기서는 24rem).
 */
const meta = {
  title: 'AI chat/대화/HeroDrop',
  component: HeroDrop,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: '24rem', height: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeroDrop>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본 (3.6초 루프)' }
