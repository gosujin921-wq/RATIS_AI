import type { Meta, StoryObj } from '@storybook/react-vite'
import { Answer } from '../components/custom/Answer'
import { MSG_BLOCKED, MSG_EXTERNAL, MSG_INTERNAL, MSG_NARROWED, MSG_REPORT } from './chat-mocks'

/**
 * AI 답변 한 건 — 안내 줄 · 본문 · 근거 · 보고서 · 고지 · 액션 · 피드백을 한 덩이로 세운다.
 *
 * ★ 근거 유형(내부 자료 · 외부 응답 · 차단)을 **배지가 아니라 문구로** 구분한다 (AC-085).
 *   배지를 쓰던 때는 안내 줄이 있으면 배지를 접는 규칙이라, 배지가 실제로 뜨는 경우가
 *   내부 자료 하나뿐이었다. 세 유형을 가르려고 만든 자리에 늘 같은 문구 하나만 서니
 *   구분이 아니라 상수였다. 지금은 근거 목록이 붙는다는 사실이 「내부 자료」를 말하고,
 *   안내 줄 문구가 외부·차단을 말한다.
 * ★ 차단만 성격이 갈린다 — 글리프 ✕, 색 danger, 즉시 읽어 준다(alert). 나머지 안내는
 *   응답과 함께 확정되는 말이라 하던 말이 끝나고 읽는다(status).
 * ★ 피드백은 **답변마다** 묻는다 (2026-09-03). 마지막 답변에만 두면 이어 물은 대화에서
 *   앞 답변은 평가할 길이 없어 대화당 한 건만 쌓인다.
 */
const meta = {
  title: 'AI chat/대화/Answer',
  component: Answer,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: '76rem' }}><Story /></div>],
  args: { message: MSG_INTERNAL, onOpenSource: () => {}, onDownloadEvidence: () => {} },
} satisfies Meta<typeof Answer>

export default meta
type Story = StoryObj<typeof meta>

export const Internal: Story = { name: '내부 자료 근거' }

/** 근거를 못 찾아 외부 응답으로 답한 경우. 안내 줄이 유형을 말한다 */
export const External: Story = { name: '외부 응답', args: { message: MSG_EXTERNAL } }

/** 차단 — 답변이 없으므로 평가도 묻지 않는다 */
export const Blocked: Story = { name: '차단됨', args: { message: MSG_BLOCKED } }

/** 범위를 좁혀 못 찾음 — 범위를 넓혀 다시 시도하라고 알린다 (AC-034) */
export const Narrowed: Story = { name: '범위에서 못 찾음', args: { message: MSG_NARROWED } }

/** 답변을 정리한 보고서가 있을 때. 방식(파일·링크)은 미확정이라 지금은 링크 한 줄이다 */
export const WithReport: Story = { name: '보고서 링크', args: { message: MSG_REPORT } }
