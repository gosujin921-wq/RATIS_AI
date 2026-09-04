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
 * ★ 사유는 **고르는 데까지고 확정은 「제출」이 맡는다** (2026-09-04). 누르는 즉시 보내면
 *   잘못 누른 것을 되돌릴 수 없다. 하나만 서고, 다시 누르면 풀린다.
 *   「도움이 됐어요」만 확인 단계 없이 그대로 보낸다.
 * ★ 제출 단추 위에 **무엇에 쓰이는지 알리는 줄**을 둔다. 질문과 답변이 함께 넘어가는 일이라
 *   고지 없이 거둘 수 없다. 링크 없이 문구만 둔다.
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

/** 「도움이 안 됐어요」를 누르면 사유·고지·확정 단추가 열리고, 「기타」를 고르면 의견 칸이 하나 더 선다 */
export const Default: Story = { name: '기본' }
