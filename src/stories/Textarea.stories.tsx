import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from '../components/ui/Textarea'

/**
 * 여러 줄 입력칸. `TextInput` 과 같은 골격·같은 클래스를 쓰므로 폼 안에서 두 칸이 같은
 * 리듬으로 앉는다.
 *
 * ★ **높이를 부품이 늘리지 않는다.** 내용에 따라 자라는 자리(대화 컴포저)는 쓰는 쪽이 줄
 *   수를 재서 넣는다 — 여기서 자동 확장을 얹으면 그 자리의 규칙(다섯 줄에서 멈추고 안에서
 *   스크롤)과 두 겹이 된다.
 * ★ 글자 수는 **한계가 있을 때만** 뜻이 있다. `maxLength` 가 없으면 세어 봐야 할 이유가 없다.
 */
const meta = {
  title: '공통 컴포넌트/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '48rem' }}><Story /></div>],
  args: { label: '추가 의견', placeholder: '어떤 점이 아쉬웠는지 알려주세요' },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

function Live(props: React.ComponentProps<typeof Textarea>) {
  const [value, setValue] = useState('')
  return <Textarea {...props} value={value} onChange={setValue} />
}

export const Default: Story = { name: '기본', render: (args) => <Live {...args} /> }

export const WithHelp: Story = {
  name: '도움말',
  render: (args) => <Live {...args} help="답변을 개선하는 데 쓰입니다. 개인정보는 적지 마세요." />,
}

/** 오류가 뜨면 도움말이 물러난다 — 둘이 함께 서면 어느 쪽을 따라야 하는지 흐려진다 */
export const Invalid: Story = {
  name: '오류',
  render: (args) => <Live {...args} help="이 도움말은 가려진다" error="내용을 입력해 주세요." />,
}

export const WithCount: Story = {
  name: '글자 수',
  render: (args) => <Live {...args} showCount maxLength={200} />,
}
