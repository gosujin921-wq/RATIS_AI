import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert } from '../components/ui/Alert'

const meta = {
  title: '공통 컴포넌트/Alert',
  component: Alert,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '52rem' }}><Story /></div>],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

/** 실패. 무엇이 잘못됐는지와 다음에 무엇을 하면 되는지를 함께 적는다 */
export const Danger: Story = {
  name: 'danger · 실패',
  args: {
    tone: 'danger',
    title: '문서를 올리지 못했습니다',
    children: '파일이 50MB를 넘습니다. 나눠서 올리거나 압축한 뒤 다시 시도하세요.',
  },
}

/** 주의. 지금 넘어가도 되지만 알고 넘어가야 하는 일 */
export const Warning: Story = {
  name: 'warning · 주의',
  args: {
    tone: 'warning',
    title: '학습에 반영되지 않은 문서가 있습니다',
    children: '3건이 색인 대기 중입니다. 반영까지 최대 10분이 걸립니다.',
  },
}

export const Success: Story = {
  name: 'success · 완료',
  args: {
    tone: 'success',
    title: '문서 12건을 등록했습니다',
    children: '색인이 끝나면 검색 결과에 나타납니다.',
  },
}

/** 곁들이는 설명. 배경으로 물러나는 회색 띠다 */
export const Info: Story = {
  name: 'info · 안내',
  args: {
    tone: 'info',
    children: '문서를 지우면 이미 만들어진 답변의 근거 표시도 함께 사라집니다.',
  },
}

/** 지금 이 화면의 사정. 나쁜 일은 아니지만 읽고 넘어가야 하는 띠라 코발트를 쓴다 */
export const Primary: Story = {
  name: 'primary · 화면 사정',
  args: {
    tone: 'primary',
    title: '읽기 전용으로 보고 있습니다',
    children: '이 문서는 다른 관리자가 편집 중입니다. 편집이 끝나면 알림을 보냅니다.',
  },
}

/** 타이틀 없이 한 줄만 */
export const BodyOnly: Story = {
  name: '서브텍스트만',
  args: { tone: 'info', children: '최근 30일 기록만 보관합니다.' },
}
