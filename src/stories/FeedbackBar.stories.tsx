import type { Meta, StoryObj } from '@storybook/react-vite'
import { FeedbackBar } from '../components/custom/FeedbackBar'

/**
 * 답변 피드백 (기획 §9) — 도움이 됐어요 · 도움이 안 됐어요.
 *
 * ★ 「오류 신고」를 두지 않는다 (2026-09-03). 신고를 눌러도 열리는 것이 부정 피드백과 같은
 *   사유 목록이었다. 사용자가 「답변이 부정확함」을 고를 때 그것이 평가인지 신고인지 스스로
 *   갈라야 할 이유가 없고, 갈라 봐야 뒤에서 쌓이는 값은 하나다.
 * ★ 추가 의견 칸은 **「기타」를 골랐을 때만** 연다. 목록에 없는 사유를 적을 자리가 「기타」이고,
 *   나머지 사유는 이미 고른 것으로 말이 끝난다.
 * ★ 닫은 답변에는 다시 묻지 않는다 — 매 답변마다 되살아나면 물음이 아니라 방해가 된다.
 */
const meta = {
  title: 'AI chat/대화/FeedbackBar',
  component: FeedbackBar,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: '68rem' }}><Story /></div>],
  args: { id: 'story', onSubmit: () => {} },
} satisfies Meta<typeof FeedbackBar>

export default meta
type Story = StoryObj<typeof meta>

/** 「도움이 안 됐어요」를 누르면 사유가 열리고, 「기타」를 고르면 의견 칸이 하나 더 선다 */
export const Default: Story = { name: '기본' }
