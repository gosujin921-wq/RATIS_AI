import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox, ChoiceGroup } from '../components/ui/Checkbox'

const meta = {
  title: '공통 컴포넌트/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { children: '개인정보 수집·이용에 동의합니다' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

export const Checked: Story = { name: '선택됨', args: { defaultChecked: true } }

/** 못 고르는 낱개. 목록에서 빼면 앞으로 생길 갈래가 있다는 사실까지 사라지므로 잠가서 둔다 */
export const Disabled: Story = {
  name: '잠김',
  args: { disabled: true, children: '이메일 수신 동의 (준비 중)' },
}

/** 이름에 넣으면 이름이 길어지는 말은 부연으로 뺀다 */
export const WithDescription: Story = {
  name: '부연 있음',
  args: {
    children: '학습 결과 재사용',
    description: '이미 학습한 문서는 다시 색인하지 않고 기존 결과를 씁니다.',
  },
}

export const Small: Story = {
  name: '작게',
  args: { size: 'small', children: '표에서 쓰는 크기' },
}

/** 여럿을 함께 세울 때. 소제목을 안 다는 자리에서는 legend 가 묶음의 이름이 된다 */
export const Group: Story = {
  name: '묶음',
  render: () => (
    <ChoiceGroup legend="검색 범위" column>
      <Checkbox defaultChecked>법령·고시</Checkbox>
      <Checkbox defaultChecked>내부 지침</Checkbox>
      <Checkbox>교육 자료</Checkbox>
      <Checkbox disabled>외부 논문 (준비 중)</Checkbox>
    </ChoiceGroup>
  ),
}

export const GroupInline: Story = {
  name: '묶음 · 한 줄',
  render: () => (
    <ChoiceGroup legend="문서 유형">
      <Checkbox size="small" defaultChecked>지침</Checkbox>
      <Checkbox size="small">절차</Checkbox>
      <Checkbox size="small">기준</Checkbox>
      <Checkbox size="small">서식</Checkbox>
    </ChoiceGroup>
  ),
}
