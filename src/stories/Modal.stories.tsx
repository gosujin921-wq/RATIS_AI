import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

/**
 * 창(모달) — 이 서비스의 창은 전부 이 하나로 선다.
 *
 * 접근성을 부품이 진다.
 *   · 열 때 초점을 안으로 옮기고 **닫을 때 열었던 자리로 되돌린다**
 *   · Tab 이 창 안에서 돈다 (초점 가둠)
 *   · Esc · 가림막 누르기로 닫는다
 *   · 열려 있는 동안 뒤 화면 스크롤을 잠근다
 *   · 이름은 쓰는 쪽이 `aria-labelledby` 로 잇는다 — 비면 「대화상자」라고만 읽힌다
 *
 * 닫기 X 는 창이 갖는다. 아래 걸음 줄에 「닫기」를 또 두지 않는다.
 */
const meta = {
  title: '공통 컴포넌트/Modal',
  component: Modal.Root,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { open: false, onOpenChange: () => {}, children: null },
} satisfies Meta<typeof Modal.Root>

export default meta
type Story = StoryObj<typeof meta>

/* ★ **열린 채로 그린다.** 창은 스토리북에서 보려고 만든 물건이 아니라 닫혀 있는 것이
   기본값인 부품이라, 그대로 두면 카탈로그에 버튼 하나만 서고 정작 볼 것이 안 보인다
   (2026-09-03). 닫아 본 뒤 다시 열 수 있게 버튼은 남긴다 */
function Demo({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const [open, setOpen] = useState(true)
  return (
    <>
      <Button variant="secondary" size="medium" onClick={() => setOpen(true)}>
        {size} 창 열기
      </Button>
      <Modal.Root open={open} onOpenChange={setOpen} size={size}>
        <Modal.Content aria-labelledby="story-modal-title">
          <Modal.Header>
            <Modal.Title id="story-modal-title">보관 기간 안내</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>대화는 90일 동안 보관되고, 기간이 지나면 자동으로 지워집니다.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button size="medium" onClick={() => setOpen(false)}>
              확인
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </>
  )
}

/** sm 40 — 결정을 묻는 창 */
export const Small: Story = { name: 'sm (결정)', render: () => <Demo size="sm" /> }
/** md 56 — 목록·검색 */
export const Medium: Story = { name: 'md (목록)', render: () => <Demo size="md" /> }
/** lg 72 — 미리보기 */
export const Large: Story = { name: 'lg (미리보기)', render: () => <Demo size="lg" /> }
