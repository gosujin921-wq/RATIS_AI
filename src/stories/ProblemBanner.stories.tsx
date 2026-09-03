import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProblemBanner } from '../components/custom/ProblemBanner'

/**
 * 오류·제한 안내 띠 (기획 §10.3) — 입력창 바로 위에 얹힌다.
 *
 * **화면을 갈아 끼우지 않는다.** 기획이 「오류가 발생해도 사용자가 입력한 질문과 이미
 * 표시된 대화가 유지되는 방식」을 못박았다. 그래서 상태마다 다른 화면을 세우지 않고
 * 대화 위에 띠 하나를 얹는다.
 *
 * 문구는 **지금 뭘 할 수 있는지**를 함께 적는다. 「오류가 발생했습니다」만 있으면 기다려야
 * 하는지 다시 눌러야 하는지 알 수 없다.
 */
const meta = {
  title: 'AI chat/대화/ProblemBanner',
  component: ProblemBanner,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: '76rem' }}><Story /></div>],
  args: { problem: { kind: 'SERVER', onRetry: () => {} } },
} satisfies Meta<typeof ProblemBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Server: Story = { name: '서버 오류' }
export const Offline: Story = { name: '연결 끊김', args: { problem: { kind: 'OFFLINE', onRetry: () => {} } } }
export const Timeout: Story = { name: '응답 지연', args: { problem: { kind: 'TIMEOUT', onRetry: () => {} } } }
export const Auth: Story = { name: '인증 만료', args: { problem: { kind: 'AUTH', onRetry: () => {} } } }
/** 다시 시도할 수 없는 상태 — 걸음 없이 안내만 남는다 */
export const Forbidden: Story = { name: '권한 없음', args: { problem: { kind: 'FORBIDDEN' } } }
export const Maintenance: Story = { name: '서비스 점검', args: { problem: { kind: 'MAINTENANCE' } } }
