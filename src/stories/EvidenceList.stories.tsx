import type { Meta, StoryObj } from '@storybook/react-vite'
import { EvidenceList } from '../components/custom/EvidenceList'
import { EV_TABLE, EV_TEXT } from './chat-mocks'

/**
 * 답변 쪽 근거 줄 — 「근거 n건」 머리와 인용 칩 (2026-09-14 협회 의견 반영).
 *
 * 카드(인용 내용·캡션·다운로드)는 여기 없다 — 오른쪽 패널의 목록 모드가 든다
 * (SourcePanel「근거 목록」· EvidenceCard). 답변에는 무엇을 인용했는지 한 줄만 남는다.
 *
 * ★ 칩은 **각진 태그**다 (design.md §4 「사각 태그 = 출처」). 위 추천 질문·버튼과 모양이
 *   갈려야 「누르면 무엇이 되는가」가 읽힌다.
 * ★ 칩 번호 = 패널 카드 순번. 답변과 패널을 오가며 같은 근거를 찾는 열쇠다.
 */
const meta = {
  title: 'AI chat/대화/EvidenceList',
  component: EvidenceList,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: '76rem' }}><Story /></div>],
  args: {
    evidences: [EV_TABLE, EV_TEXT],
    id: 'story',
    onOpenSource: (e) => console.info('[스토리] 원문', e.chunkId),
    onOpenList: () => console.info('[스토리] 근거 목록'),
  },
} satisfies Meta<typeof EvidenceList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '근거 2건' }

export const One: Story = { name: '근거 1건', args: { evidences: [EV_TABLE] } }

/** 근거가 넷이면 칩이 줄을 접는다. 제목은 한 줄로 잘리고 전체 이름은 패널이 말한다 */
export const Many: Story = {
  name: '근거 4건',
  args: {
    evidences: [
      EV_TABLE,
      EV_TEXT,
      { ...EV_TABLE, chunkId: 'ev-3', pageNo: 21 },
      { ...EV_TEXT, chunkId: 'ev-4', pageNo: 33 },
    ],
  },
}
