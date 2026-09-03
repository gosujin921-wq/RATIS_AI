import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../components/ui/Button'
import { DocumentDeleteDialog } from '../pages/admin/DocumentDeleteDialog'
import { ADMIN_DOCUMENTS } from '../demo/data/admin-documents'

/**
 * 문서 삭제 확인 창.
 *
 * 되돌릴 수 없는 걸음이라 **무엇이 함께 사라지는지**를 적는다 — 문서만이 아니라 그 색인
 * 조각까지 지워지고, 그 결과 챗봇이 이 문서를 근거로 못 쓰게 된다.
 * 제목은 「무슨 일이 일어나는가」다. 누른 버튼 이름(삭제)을 되풀이하지 않는다.
 */
const meta = {
  title: '관리자 페이지/DocumentDeleteDialog',
  component: DocumentDeleteDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { onConfirm: () => {}, onClose: () => {} },
} satisfies Meta<typeof DocumentDeleteDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: '기본',
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>창 열기</Button>
        <DocumentDeleteDialog
          document={open ? ADMIN_DOCUMENTS[0] : undefined}
          onConfirm={() => setOpen(false)}
          onClose={() => setOpen(false)}
        />
      </>
    )
  },
}
