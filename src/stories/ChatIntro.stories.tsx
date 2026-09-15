import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatIntro } from '../components/custom/ChatIntro'

/**
 * 시작 화면 — 대화가 아직 없을 때 스트림 자리에 선다.
 *
 * 심볼(파동 + 도달, HeroWave)은 **장식 전용**이다(보조기술에는 숨긴다). 시스템이 살아 있다는
 * 신호일 뿐이고, 뜻은 아래 문구가 진다. 추천 질문은 여기가 아니라 입력창 아래에 선다.
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

export const Default: Story = { name: '기본 (파동 심볼)' }

/** 둘째 심볼 후보 — 유리 구슬 터짐 → 링 (docs/mov2.mov). 어두운 무대를 제 안에 갖는다 */
export const Orbs: Story = { name: '구슬 심볼', args: { symbol: 'orbs' } }

/** 셋째 심볼 후보 — 씨앗 → 링 → 방울 → 회전 (docs/mov.mov). 박스 없이 밝은 면 위에 바로 선다 */
export const Drop: Story = { name: '방울 심볼', args: { symbol: 'drop' } }
