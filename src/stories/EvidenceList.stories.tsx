import type { Meta, StoryObj } from '@storybook/react-vite'
import { EvidenceList } from '../components/custom/EvidenceList'
import { EV_TABLE, EV_TEXT } from './chat-mocks'

/**
 * 근거 목록 — 답변이 인용한 원문. 접이식이라 대화가 쌓여도 각 답변이 자기 근거를 들고 있다.
 *
 * ★ 출처 계층을 **카테고리 › 구역·표 › 쪽** 으로 적는다. 문서명만 있으면 그 문서 어디를
 *   봐야 하는지 알 수 없다.
 * ★ **캡션(단위·주·출처)을 생략하지 않는다** (NFR-008). 빠지면 수치가 맞아도 오독된다.
 * ★ 원문을 통째로 받는 자리는 **묶음 줄 하나**다. 카드마다 다운로드를 세우면 근거 세 건짜리
 *   답변에 같은 단추가 셋 선다.
 */
const meta = {
  title: 'AI chat/대화/EvidenceList',
  component: EvidenceList,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: '76rem' }}><Story /></div>],
  args: { evidences: [EV_TABLE, EV_TEXT], id: 'story', onDownload: () => {} },
} satisfies Meta<typeof EvidenceList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '근거 2건' }

export const TableOnly: Story = { name: '표 하나', args: { evidences: [EV_TABLE] } }

/** 받을 파일이 없는 근거는 「원문 보기」만 선다 */
export const NoFile: Story = {
  name: '파일 없는 근거',
  args: { evidences: [{ ...EV_TEXT, fileUrl: undefined }] },
}
