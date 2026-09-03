import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowUp, Copy, Download, Pencil, Square, Trash2, X } from 'lucide-react'
import { IconButton } from '../components/custom/IconButton'

/**
 * 아이콘 전용 정사각 버튼. 글자를 떼고 글리프만 세우는 자리에 쓴다.
 *
 * ★ 아이콘만 있으므로 `aria-label` 이 **필수**다. 눈으로 보는 사람에게는 모양이 이름을
 *   대신하지만 보조기술에는 이름이 없으면 「버튼」으로만 읽힌다.
 * ★ 잠글 때 `disabled` 와 `aria-disabled` 가 갈린다. `disabled` 는 hover·focus 가 아예
 *   오지 않아 왜 못 누르는지 알려 줄 자리가 사라진다.
 */
const meta = {
  title: '공통 컴포넌트/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { 'aria-label': '답변 복사', children: <Copy aria-hidden /> },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

/** 28 · 32 · 36. 아이콘은 박스의 절반 (design.md §3) */
export const Sizes: Story = {
  name: '크기 사다리',
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
      <IconButton {...args} size="sm" aria-label="작게" />
      <IconButton {...args} size="md" aria-label="보통" />
      <IconButton {...args} size="lg" aria-label="크게" />
    </div>
  ),
}

/** 톤은 **뜻**이다. 삭제류는 danger, 그 줄의 주요 동작은 primary */
export const Tones: Story = {
  name: '톤',
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
      <IconButton {...args} aria-label="기본" />
      <IconButton {...args} tone="primary" aria-label="다운로드" children={<Download aria-hidden />} />
      <IconButton {...args} tone="muted" aria-label="닫기" children={<X aria-hidden />} />
      <IconButton {...args} tone="danger" aria-label="삭제" children={<Trash2 aria-hidden />} />
    </div>
  ),
}

/**
 * 원형은 **그 자리에서 끝나는 한 동작** 전용이다 (컴포저의 보내기·정지).
 * 도구 줄에 여럿 늘어서는 자리에는 쓰지 않는다 — 원은 목록에 섞이지 않는 모양이다.
 */
export const Circle: Story = {
  name: '원형 · 채움 (보내기)',
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
      <IconButton {...args} size="lg" shape="circle" filled aria-label="질문 보내기">
        <ArrowUp aria-hidden />
      </IconButton>
      <IconButton {...args} size="lg" shape="circle" filled aria-label="답변 생성 중단">
        <Square aria-hidden fill="currentColor" strokeWidth={0} />
      </IconButton>
    </div>
  ),
}

export const Disabled: Story = {
  name: '잠김',
  args: { disabled: true, 'aria-label': '질문 보내기', children: <Pencil aria-hidden /> },
}
