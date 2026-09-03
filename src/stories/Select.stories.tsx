import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from '../components/ui/Select'

const meta = {
  title: '공통 컴포넌트/Select',
  component: Select,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '28rem', paddingBottom: '20rem' }}><Story /></div>],
  args: {
    label: '카테고리',
    options: [
      { value: 'MEMBER', label: '회원' },
      { value: 'DATA', label: '학습데이터' },
      { value: 'AI', label: '생성형 AI' },
      { value: 'ETC', label: '기타' },
    ],
    defaultValue: 'MEMBER',
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

export const Required: Story = { name: '필수', args: { required: true } }

export const WithHint: Story = {
  name: '도움말',
  args: { hint: '지금 상태에서 걸 수 있는 조치만 나옵니다.' },
}

export const Invalid: Story = { name: '오류', args: { error: '카테고리를 골라 주세요.' } }
