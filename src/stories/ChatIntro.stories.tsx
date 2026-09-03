import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatIntro } from '../components/custom/ChatIntro'

/**
 * 시작 화면 — 대화가 아직 없을 때 스트림 자리에 선다.
 *
 * 오브는 **장식 전용**이다(보조기술에는 숨긴다). 시스템이 살아 있다는 신호일 뿐이고,
 * 뜻은 아래 문구가 진다.
 *
 * 문구는 **시스템이 무엇을 할 수 있는지** 밝힌다 (HAX G1). 「무엇이든 물어보세요」처럼
 * 범위를 열어 두면 답할 수 없는 것을 묻게 되고, 그 실패가 시스템 탓으로 남는다.
 */
const meta = {
  title: 'AI chat/대화/ChatIntro',
  component: ChatIntro,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={{ padding: '4rem 0' }}><Story /></div>],
} satisfies Meta<typeof ChatIntro>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }
