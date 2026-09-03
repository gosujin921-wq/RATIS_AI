import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/custom/Dialog'

/**
 * 결정을 묻는 짧은 창. **제목이 「무슨 일이 일어나는가」를 말한다.**
 *
 * 폼이 든 큰 창은 이것으로 만들지 않는다 (그건 다른 창이다).
 * 푸터에 「닫기」를 두지 않는다 — 우상단 X 가 이미 그 일을 한다. 「취소」처럼 뜻이 있는
 * 걸음만 둔다.
 */
const meta = {
  title: '공통 컴포넌트/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  /* 창은 스스로 열림 상태를 들고 있는 예시 부품으로 그린다. 이 기본값은 타입을 채우는 몫이다 */
  args: { open: false, onOpenChange: () => {}, title: '', desc: '' },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

/** 대화 삭제 확인 — 되돌릴 수 없는 걸음이라 바로 지우지 않는다 */
function DeleteExample() {
  const [open, setOpen] = useState(true)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        삭제 확인 열기
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="이 대화를 삭제할까요?"
        desc={
          <>
            <strong>2024년 이용기관 수 변화</strong> 의 질문과 답변이 모두 지워집니다. 되돌릴 수
            없습니다.
          </>
        }
        main={{ label: '삭제', onClick: () => setOpen(false) }}
        sub={{ label: '취소', onClick: () => setOpen(false) }}
      />
    </>
  )
}

export const Delete: Story = {
  name: '삭제 확인',
  render: () => <DeleteExample />,
}

/** 알리는 것이 전부인 창. 걸음이 없고 X 로만 닫는다 */
function NoticeExample() {
  const [open, setOpen] = useState(true)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        안내 창 열기
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="대화는 90일 동안 보관됩니다"
        desc="보관 기간이 지나면 자동으로 지워집니다. 남겨 두려면 답변을 복사하거나 원문을 내려받으세요."
      />
    </>
  )
}

export const NoStep: Story = {
  name: '걸음 없는 안내',
  render: () => <NoticeExample />,
}
