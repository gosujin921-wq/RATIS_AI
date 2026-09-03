import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../components/ui/Button'
import { Download, Plus, RefreshCw } from 'lucide-react'

/**
 * 버튼 — 이 서비스의 버튼은 전부 이 하나로 선다. 모양이 전부 토큰에서 온다.
 *
 * **캡슐이다.** `--ratis-radius-max` 하나를 읽으므로 급과 무관하게 알약으로 선다
 * (design.md §7 — 명령하는 조작은 둥글게, 내용 상자는 각지게).
 *
 * **급은 두 개뿐이다 — sm(36) · md(44).** lg(52)는 화면을 끝내는 제출 버튼을 위한 급인데
 * 이 서비스에는 그런 자리가 없다. 기본값은 md 라 빼먹어도 52 가 나오지 않는다.
 *
 * 모양을 **우리가 낸다.** 외부 킷을 쓰던 동안에는 킷이 `height: auto !important` 를 걸어 두어,
 * 사이드바 줄처럼 다른 리듬이 필요한 자리마다 특정도를 세 겹으로 올리고 `!important` 로
 * 되받아야 했다.
 */
const meta = {
  title: '공통 컴포넌트/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    /* 컨트롤에도 우리가 쓰는 값만 내놓는다 — 목록에 있으면 언젠가 눌러 보게 된다 */
    variant: {
      options: ['primary', 'secondary', 'tertiary', 'text'],
      control: 'inline-radio',
    },
    size: { options: ['small', 'medium'], control: 'inline-radio' },
  },
  args: { variant: 'primary', size: 'medium', children: '질문하기' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

/**
 * 무게 차례: primary 채움 → secondary 선 → tertiary 옅은 면 → text 글자만.
 * **강조는 화면당 하나면 된다.** 대화 화면에서 그 자리는 컴포저의 보내기가 이미 쓰고 있다.
 */
export const Variants: Story = {
  name: '갈래',
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
      <Button {...args} variant="primary">보내기</Button>
      <Button {...args} variant="secondary">다시 시도</Button>
      <Button {...args} variant="tertiary">원문 보기</Button>
      <Button {...args} variant="text">취소</Button>
    </div>
  ),
}

/** sm 36 · md 44. 좌우 여백은 높이 비례가 아니라 누진이다 (14 → 20) */
export const Sizes: Story = {
  name: '급 (sm · md)',
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
      <Button {...args} size="small">작게 36</Button>
      <Button {...args} size="medium">보통 44</Button>
    </div>
  ),
}

/** 글리프는 이름 앞에 선다. 간격은 킷 토큰(sm 6 · md 8)이 진다 */
export const WithIcon: Story = {
  name: '아이콘 + 이름',
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
      <Button {...args} variant="text" size="medium">
        <Plus size={18} aria-hidden />
        새 대화
      </Button>
      <Button {...args} variant="secondary" size="small">
        <Download size={16} aria-hidden />
        원문 다운로드
      </Button>
      <Button {...args} variant="tertiary" size="small">
        <RefreshCw size={16} aria-hidden />
        다시 시도
      </Button>
    </div>
  ),
}

/** 잠김은 색을 유지한 채 흐려진다 (opacity 0.5). 색을 회색으로 바꾸지 않는다 */
export const Disabled: Story = {
  name: '잠김',
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
      <Button {...args} variant="primary" disabled>보내기</Button>
      <Button {...args} variant="secondary" disabled>다시 시도</Button>
    </div>
  ),
}
