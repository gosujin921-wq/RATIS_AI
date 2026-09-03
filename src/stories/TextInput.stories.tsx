import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextInput } from '../components/ui/TextInput'

const meta = {
  title: '공통 컴포넌트/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  args: { label: '문서 제목', placeholder: '제목을 입력하세요' },
  decorators: [(Story) => <div style={{ width: '42rem' }}><Story /></div>],
} satisfies Meta<typeof TextInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

export const Required: Story = { name: '필수', args: { required: true } }

/** 무엇을 어떻게 넣는지에 대한 안내 */
export const WithHelp: Story = {
  name: '도움말',
  args: { help: '목록과 검색 결과에 그대로 보이는 이름입니다.' },
}

/** 오류가 뜨면 도움말이 물러난다. 무엇이 잘못됐는지와 어떻게 고치는지를 함께 적는다 */
export const Invalid: Story = {
  name: '오류',
  args: {
    required: true,
    defaultValue: '',
    help: '목록과 검색 결과에 그대로 보이는 이름입니다.',
    error: '제목을 입력하세요. 2자 이상 60자 이하입니다.',
  },
}

export const Disabled: Story = {
  name: '잠김',
  args: { disabled: true, defaultValue: 'DOC-2026-0142' },
}

export const Small: Story = {
  name: '작게',
  args: { size: 'small', label: '검색어', placeholder: '문서 제목 · 본문 검색' },
}
