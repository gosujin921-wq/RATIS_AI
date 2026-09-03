import type { Meta, StoryObj } from '@storybook/react-vite'
import { MessageCircle, Plus, Search, Settings } from 'lucide-react'
import { SideRow } from '../components/custom/SideRow'

/**
 * 사이드바 줄 — 글리프 하나와 이름 하나로 서는 조작.
 *
 * 「새 대화」와 「대화 검색」이 이 부품 하나를 나눠 쓴다. 같은 자리에 나란히 서는 조작이
 * 서로 다른 문법이면 한 묶음으로 안 읽힌다.
 *
 * **버튼으로 강조하지 않는다.** 면도 선도 없는 평범한 메뉴 줄이다 — 강조는 화면당 하나면
 * 되고 그 자리는 대화 화면의 보내기가 이미 쓰고 있다.
 *
 * 자리(폭·바깥 여백)는 셸이 정한다. 이 부품은 줄 **자체의 모양**만 진다.
 */
const meta = {
  title: 'AI chat/사이드바/SideRow',
  component: SideRow,
  tags: ['autodocs'],
  /* 사이드바 폭에서만 제 비례가 보인다 */
  decorators: [
    (Story) => (
      <div style={{ width: '24rem', padding: '1.2rem', background: 'var(--ratis-gray-5)' }}>
        <Story />
      </div>
    ),
  ],
  args: { icon: <Plus size={18} aria-hidden />, label: '새 대화' },
} satisfies Meta<typeof SideRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

/** 사이드바에 실제로 서는 두 줄. 글리프만 다르고 나머지는 같다 */
export const Group: Story = {
  name: '나란히 선 두 줄',
  render: (args) => (
    <>
      <SideRow {...args} icon={<Plus size={18} aria-hidden />} label="새 대화" />
      <SideRow
        {...args}
        icon={<Search size={18} aria-hidden />}
        label="대화 검색"
        aria-haspopup="dialog"
      />
    </>
  ),
}

/** 이름이 길어져도 줄 높이는 그대로다. 글리프 칸이 고정이라 이름 자리가 흔들리지 않는다 */
export const LongLabel: Story = {
  name: '긴 이름',
  args: { icon: <MessageCircle size={18} aria-hidden />, label: '지난 대화 전체 보기' },
}

export const OtherGlyph: Story = {
  name: '다른 글리프',
  args: { icon: <Settings size={18} aria-hidden />, label: '설정' },
}
