import type { Meta, StoryObj } from '@storybook/react-vite'
import { BrandLogo } from '../components/custom/BrandLogo'

/**
 * 브랜드 락업 — RATIS 공식 CI 워드마크 + 서비스 표기 `AI`.
 *
 * `AI` 는 **글자가 아니라 SVG 로 그린다.** 워드마크와 같은 좌표계로 그려 베이스라인을
 * 레터 밑선에 맞춘다 — 글자로 두면 서체 메트릭에 따라 밑선이 어긋난다.
 *
 * 크기는 `--logo-h` 하나로 정한다. 두 조각이 같은 값을 읽어 어떤 크기에서도 비율이 유지된다.
 */
const meta = {
  title: 'AI chat/사이드바/BrandLogo',
  component: BrandLogo,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '1.6rem', background: 'var(--ratis-gray-5)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BrandLogo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본 (34)' }

/** `--logo-h` 를 바꾸면 워드마크와 AI 가 함께 자란다 */
export const Sizes: Story = {
  name: '크기',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      <div style={{ ['--logo-h' as string]: '2.6rem' }}><BrandLogo /></div>
      <div style={{ ['--logo-h' as string]: '3.4rem' }}><BrandLogo /></div>
      <div style={{ ['--logo-h' as string]: '5rem' }}><BrandLogo /></div>
    </div>
  ),
}
