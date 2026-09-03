import type { Meta, StoryObj } from '@storybook/react-vite'
import { PendingAnswer } from '../components/custom/PendingAnswer'

/**
 * 답변 생성 중인 턴.
 *
 * **상태를 글자로도 전한다** (AC-110). 점 애니메이션만 두면 눈으로 보는 사람에게만
 * 전해진다. 보조기술에는 「답변 생성 중」 한 줄만 알린다 — 흘러드는 토큰을 매번 읽으면
 * 못 쓰는 화면이 된다.
 *
 * **부분 답변이 있어도 근거·유형은 그리지 않는다.** 둘은 응답이 끝나야 확정되는데, 내부
 * 근거인 줄 알고 읽었다가 끝나서 외부 응답이면 불변식이 깨진다 (AC-026).
 */
const meta = {
  title: 'AI chat/대화/PendingAnswer',
  component: PendingAnswer,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: '76rem' }}><Story /></div>],
  args: { question: '2024년 방사선 이용기관 수는 어떻게 변했나요?' },
} satisfies Meta<typeof PendingAnswer>

export default meta
type Story = StoryObj<typeof meta>

/** 첫 글자 전 — 답변 골격만 보여 준다 */
export const Skeleton: Story = { name: '대기 (골격)' }

/** 스트리밍으로 글자가 붙는 중 */
export const Streaming: Story = {
  name: '스트리밍',
  args: {
    partial:
      '2024년 국내 방사선 이용기관은 총 9,132개소로 전년(8,874개소) 대비 약 2.9% 증가했습니다.\n\n분야별로는 산업체가',
  },
}

/** 오래 걸릴 때 — 기다리면 되는 상황임을 한 줄 더 말한다 */
export const Slow: Story = { name: '지연 안내', args: { slow: true } }
