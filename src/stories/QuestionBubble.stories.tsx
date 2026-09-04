import type { Meta, StoryObj } from '@storybook/react-vite'
import { QuestionBubble } from '../components/custom/QuestionBubble'

/**
 * 사용자 질문 — 오른쪽 말풍선.
 *
 * 복사는 말풍선 왼쪽에 **숨어 있다가 마우스·초점이 닿을 때** 나온다. 질문은 사용자가 쓴
 * 문장이라 되읽을 일이 드물고, 턴마다 아이콘이 서면 대화가 조작으로 뒤덮인다.
 *
 * 보낸 질문은 고치지 않는다. 다르게 묻고 싶으면 아래 입력창에서 새로 묻는다.
 */
const meta = {
  title: 'AI chat/대화/QuestionBubble',
  component: QuestionBubble,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: '76rem' }}><Story /></div>],
  args: { question: '2024년 방사선 이용기관 수는 어떻게 변했나요?' },
} satisfies Meta<typeof QuestionBubble>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본 (마우스를 올리면 복사)' }

/** 긴 질문 — 말풍선이 폭 한계에서 접힌다 */
export const Long: Story = {
  name: '긴 질문',
  args: {
    question:
      '최근 3년간 방사선 이용기관 수와 종사자 수를 분야별로 비교하고, 증가율이 가장 높은 분야가 어디인지 근거와 함께 알려주세요.',
  },
}
