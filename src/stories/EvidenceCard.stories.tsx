import type { Meta, StoryObj } from '@storybook/react-vite'
import { EvidenceCard } from '../components/custom/EvidenceCard'
import { EV_TABLE, EV_TEXT } from './chat-mocks'

/**
 * 근거 카드 — 오른쪽 패널의 목록 모드에 선다 (2026-09-14 부터. 종전에는 답변 아래 접이식).
 *
 * ★ 출처 계층을 **순번 › 카테고리 › 구역·표 › 쪽** 으로 적는다.
 * ★ **캡션(단위·주·출처)을 생략하지 않는다** (NFR-008).
 * ★ 「원문 보기」는 같은 패널을 원문 모드로 바꾼다. 「다운로드」는 파일 자리가 있을 때만 선다.
 */
const meta = {
  title: 'AI chat/대화/EvidenceCard',
  component: EvidenceCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: '48rem' }}><Story /></div>],
  args: { evidence: EV_TABLE, index: 1, onOpenSource: () => {}, onDownload: () => {} },
} satisfies Meta<typeof EvidenceCard>

export default meta
type Story = StoryObj<typeof meta>

export const Table: Story = { name: '표 근거' }

export const Text: Story = { name: '본문 근거', args: { evidence: EV_TEXT, index: 2 } }

/** 받을 파일이 없는 근거는 「원문 보기」만 선다 */
export const NoFile: Story = {
  name: '파일 없는 근거',
  args: { evidence: { ...EV_TEXT, fileUrl: undefined }, index: 2 },
}
