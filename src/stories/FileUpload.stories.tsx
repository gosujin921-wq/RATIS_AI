import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileUpload } from '../components/ui/FileUpload'

const meta = {
  title: '공통 컴포넌트/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '44rem' }}><Story /></div>],
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: '기본',
  args: {
    title: '첨부파일',
    description: '최대 3개 · 1개당 10MB까지 올릴 수 있습니다.',
    maxFiles: 3,
    maxFileSize: 10 * 1024 * 1024,
  },
}

/** 한 개만 받는 자리 — 형식을 가린다 */
export const Image: Story = {
  name: '이미지 한 장',
  args: {
    title: '대표이미지',
    description: 'JPG · PNG · WEBP · 최대 5MB. 올리지 않으면 목록에 기본 이미지가 대신 섭니다.',
    maxFiles: 1,
    maxFileSize: 5 * 1024 * 1024,
    acceptedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
}

export const Disabled: Story = { name: '잠김', args: { title: '첨부파일', disabled: true } }
