import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChoiceGroup } from '../components/ui/Checkbox'
import { Radio } from '../components/ui/Radio'

const meta = {
  title: '공통 컴포넌트/Radio',
  component: Radio,
  tags: ['autodocs'],
  args: { name: 'demo', children: '최근 1년' },
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

export const Checked: Story = { name: '선택됨', args: { defaultChecked: true } }

export const Disabled: Story = { name: '잠김', args: { disabled: true } }

/**
 * 라디오 줄 — 선택지에 `전체` 처럼 조건을 안 거는 상태가 섞여 있는 자리.
 * 세그먼트는 갈래가 대등하다고 말하는 모양이라 `전체` 가 나머지와 같은 값처럼 읽힌다.
 */
export const Group: Story = {
  name: '묶음',
  render: () => (
    <ChoiceGroup legend="갱신 기간" column>
      <Radio name="period" defaultChecked>
        전체
      </Radio>
      <Radio name="period">최근 1년</Radio>
      <Radio name="period">최근 3년</Radio>
      <Radio name="period">직접 지정</Radio>
    </ChoiceGroup>
  ),
}

export const GroupInline: Story = {
  name: '묶음 · 한 줄',
  render: () => (
    <ChoiceGroup legend="공개 범위">
      <Radio size="small" name="scope" defaultChecked>
        전체 공개
      </Radio>
      <Radio size="small" name="scope">
        내부 공개
      </Radio>
      <Radio size="small" name="scope">
        비공개
      </Radio>
    </ChoiceGroup>
  ),
}

export const WithDescription: Story = {
  name: '부연 있음',
  render: () => (
    <ChoiceGroup legend="답변 방식" column>
      <Radio name="mode" defaultChecked description="문서에 있는 내용만 답합니다. 근거 문단을 함께 보여 줍니다.">
        문서 기반
      </Radio>
      <Radio name="mode" description="문서에 없으면 모델이 아는 범위에서 답합니다. 근거가 없을 수 있습니다.">
        일반 답변 허용
      </Radio>
    </ChoiceGroup>
  ),
}
