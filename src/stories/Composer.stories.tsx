import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Composer } from '../components/custom/Composer'

/**
 * 질문 입력 — 화면 아래에 도킹하는 캡슐 하나.
 *
 * **캡슐 전체가 입력 영역이다.** 여백을 눌러도 커서가 들어온다. 보이는 상자와 글자를 받는
 * 자리가 다르면 가장자리를 눌렀을 때 아무 일도 없어 「눌러도 안 되는 칸」으로 읽힌다.
 *
 * **한 줄이면 캡슐, 길어지면 라운드 스퀘어.** 모양이 곧 상태다. 다섯 줄에서 멈추고 안에서
 * 스크롤한다 — 계속 자라면 긴 질문을 쓸수록 방금 읽던 답변이 화면 밖으로 밀린다.
 *
 * **보내기와 멈추기는 한 자리다.** 답변 안에 중단 버튼을 따로 두면 스트림을 따라 내려가며
 * 그걸 쫓아야 하는데, 컴포저는 늘 같은 자리에 있다.
 */
const CATEGORIES = [
  { categoryId: 'c1', categoryName: '실태조사 통계표' },
  { categoryId: 'c2', categoryName: '전문보고서' },
  { categoryId: 'c3', categoryName: '정책·법령 자료' },
  { categoryId: 'c4', categoryName: '교육·행사 자료' },
]

const meta = {
  title: 'AI chat/대화/Composer',
  component: Composer,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: '76rem', padding: '2.4rem 0' }}><Story /></div>],
  args: {
    value: '',
    onChange: () => {},
    onSubmit: () => {},
    scope: [],
    onScopeChange: () => {},
    categories: CATEGORIES,
  },
} satisfies Meta<typeof Composer>

export default meta
type Story = StoryObj<typeof meta>

function Live({ initial = '', pending }: { initial?: string; pending?: boolean }) {
  const [value, setValue] = useState(initial)
  const [scope, setScope] = useState<string[]>([])
  return (
    <Composer
      value={value}
      onChange={setValue}
      onSubmit={() => setValue('')}
      onStop={() => {}}
      pending={pending}
      categories={CATEGORIES}
      scope={scope}
      onScopeChange={setScope}
    />
  )
}

export const Empty: Story = { name: '빈 칸', render: () => <Live /> }

/** 여러 줄이 되면 캡슐이 라운드 스퀘어로 펴진다 */
export const MultiLine: Story = {
  name: '여러 줄',
  render: () => <Live initial={'2024년 이용기관 수와\n종사자 수를 함께\n표로 정리해 주세요'} />,
}

/** 답변을 기다리는 동안에는 같은 자리가 정지 단추가 된다 */
export const Pending: Story = { name: '생성 중 (정지)', render: () => <Live pending /> }

/** 고를 범위가 없으면 그 자리를 아예 그리지 않는다 */
export const NoScope: Story = {
  name: '범위 없음',
  args: { categories: [] },
  render: (args) => <Composer {...args} />,
}
