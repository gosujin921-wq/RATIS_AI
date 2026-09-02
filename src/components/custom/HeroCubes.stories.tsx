import type { Meta, StoryObj } from '@storybook/react-vite'

import { HeroCubes } from './HeroCubes'

/**
 * HeroCubes 는 `position: absolute; inset: 0` 캔버스라 부모가 크기를 잡아줘야 보인다.
 * 여기서는 히어로 섹션과 비슷한 높이·배경을 준 상태로 확인한다.
 */
const meta = {
  title: 'Custom/HeroCubes',
  component: HeroCubes,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div
        style={{
          position: 'relative',
          minHeight: 680,
          background: 'linear-gradient(135deg, #f4f7ff 0%, #e8eeff 100%)',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeroCubes>

export default meta
type Story = StoryObj<typeof meta>

/** 원본 랜딩 배치 — 좌측에 문구가 들어올 자리를 비우고 우측으로 밀려 있다. */
export const Default: Story = {}

/** 대화 시작 화면(SCREEN-001)에서 쓰는 배치 — 캔버스 한가운데. */
export const Centered: Story = { args: { centered: true } }
