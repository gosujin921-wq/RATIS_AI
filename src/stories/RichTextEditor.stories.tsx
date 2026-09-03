import type { Meta, StoryObj } from '@storybook/react-vite'
import { RichTextEditor } from '../components/custom/RichTextEditor'

const meta = {
  title: '공통 컴포넌트/RichTextEditor',
  component: RichTextEditor,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '60rem' }}><Story /></div>],
  args: { ariaLabel: '약관 본문' },
} satisfies Meta<typeof RichTextEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본', args: { minHeight: 24 } }

/** 회원이 쓰는 자리 — 제목 급을 뺀다. 남의 화면에서 제목처럼 서면 안 되는 글이다 */
export const Minimal: Story = { name: '간소', args: { tools: 'minimal', minHeight: 16 } }

export const ReadOnly: Story = {
  name: '읽기 전용',
  args: {
    readOnly: true,
    minHeight: 16,
    defaultValue: '<h3>제1조 목적</h3><p>이 약관은 서비스 이용에 관한 사항을 정합니다.</p>',
  },
}
