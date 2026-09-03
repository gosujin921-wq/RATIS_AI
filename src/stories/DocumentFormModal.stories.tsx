import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../components/ui/Button'
import { DocumentFormModal } from '../pages/admin/DocumentFormModal'
import { ADMIN_DOCUMENTS } from '../demo/data/admin-documents'

/**
 * 문서 등록·수정 창 (문서 관리).
 *
 * 등록과 수정이 한 창이다 — 채우는 칸이 같고 다른 것은 파일을 새로 받느냐뿐이다.
 *
 * ★ **열린 채로 그린다.** 창은 닫혀 있는 것이 기본값인 부품이라 그대로 두면 카탈로그에
 *   버튼 하나만 서고 정작 볼 것이 안 보인다. 닫아 본 뒤 다시 열 수 있게 버튼은 남긴다.
 */
const meta = {
  title: '관리자 페이지/DocumentFormModal',
  component: DocumentFormModal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { open: true, onClose: () => {} },
} satisfies Meta<typeof DocumentFormModal>

export default meta
type Story = StoryObj<typeof meta>

function Demo({ document }: { document?: (typeof ADMIN_DOCUMENTS)[number] }) {
  const [open, setOpen] = useState(true)
  return (
    <>
      <Button onClick={() => setOpen(true)}>창 열기</Button>
      <DocumentFormModal open={open} document={document} onClose={() => setOpen(false)} />
    </>
  )
}

/** 등록 — 파일을 받는 자리가 선다 */
export const Create: Story = { name: '등록', render: () => <Demo /> }

/** 수정 — 파일 자리가 안내 띠로 바뀐다. 파일을 갈면 색인을 처음부터 다시 돌려야 한다 */
export const Edit: Story = { name: '수정', render: () => <Demo document={ADMIN_DOCUMENTS[0]} /> }
