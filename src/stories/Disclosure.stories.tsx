import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Disclosure } from '../components/ui/Disclosure'

/**
 * 접이식 — 토글 한 줄과 그 아래 패널.
 *
 * ★ `aria-expanded` · `aria-controls` · 패널 id 를 **부품이 잇는다.** 손으로 이으면 화면마다
 *   하나씩 빠진다.
 * ★ 패널에 **회색 트레이를 깔지 않는다.** 이 서비스에서 접이식이 서는 자리는 이미 카드나
 *   판 안이라, 면 위에 면이 또 깔리면 상자가 두 겹으로 읽힌다 (design.md §5).
 * ★ 열림 상태는 **쓰는 쪽이 갖는다** — 접힌 채로 시작할지, 다른 것을 열면 닫을지는 그
 *   화면의 규칙이다.
 */
const meta = {
  title: '공통 컴포넌트/Disclosure',
  component: Disclosure,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '52rem' }}><Story /></div>],
  args: { buttonText: '근거 2건', expanded: false, onToggle: () => {}, children: null },
} satisfies Meta<typeof Disclosure>

export default meta
type Story = StoryObj<typeof meta>

function Live({ label }: { label: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Disclosure buttonText={label} expanded={open} onToggle={setOpen}>
      <p style={{ margin: 0, fontSize: 'var(--ratis-font-md)', color: 'var(--ratis-text-muted)' }}>
        접힌 자리에 든 내용. 패널의 모양은 그 안에 든 것이 정한다.
      </p>
    </Disclosure>
  )
}

export const Default: Story = { name: '기본', render: () => <Live label="근거 2건" /> }

/** 이름에 조각을 넣을 수 있다 — 숫자를 다른 급으로 세우는 자리 */
export const RichLabel: Story = {
  name: '이름에 조각',
  render: () => (
    <Live
      label={
        <>
          근거 <strong style={{ color: 'var(--ratis-text-brand)' }}>2건</strong>
        </>
      }
    />
  ),
}
