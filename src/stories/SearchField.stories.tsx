import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchField } from '../components/custom/SearchField'

const meta = {
  title: '공통 컴포넌트/SearchField',
  component: SearchField,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '26rem' }}><Story /></div>],
  args: { 'aria-label': '회원 검색', placeholder: '이름 · 아이디로 찾기' },
} satisfies Meta<typeof SearchField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

export const Small: Story = { name: '작게', args: { size: 'small' } }
