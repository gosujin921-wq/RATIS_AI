import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChipGroup } from '../components/custom/ChipGroup'

/**
 * 칩 묶음 — 조건을 고르는 캡슐 줄.
 *
 * **모양이 곧 뜻이다** (design.md §4).
 *   낱개로 흩어진 칩 = 여러 개 켤 수 있다
 *   붙인 세그먼트 한 덩어리 = 하나만 켜진다
 * 미선택 상태에서도 몇 개를 고를 수 있는지 모양으로 알 수 있어야 한다.
 */
const meta = {
  title: '공통 컴포넌트/ChipGroup',
  component: ChipGroup,
  tags: ['autodocs'],
  /* 아래 스토리들은 상태를 들고 있는 예시 부품으로 그린다. 이 기본값은 타입을 채우는 몫이다 */
  args: {
    label: '검색 범위',
    options: [{ value: 'c1', label: '실태조사 통계표' }],
    value: [],
    onChange: () => {},
  },
} satisfies Meta<typeof ChipGroup>

export default meta
type Story = StoryObj<typeof meta>

/** 대화 화면의 검색 범위 줄. 여러 갈래를 함께 켤 수 있다 */
function ScopeExample() {
  const [value, setValue] = useState<string[]>([])
  return (
    <ChipGroup
      label="검색 범위"
      size="small"
      value={value}
      onChange={setValue}
      options={[
        { value: 'c1', label: '실태조사 통계표' },
        { value: 'c2', label: '전문보고서' },
        { value: 'c3', label: '정책·법령 자료' },
        { value: 'c4', label: '교육·행사 자료' },
      ]}
    />
  )
}

export const Multi: Story = {
  name: '다중 선택 (검색 범위)',
  render: () => <ScopeExample />,
}

/** 답변 피드백의 사유. 목록에 없는 것은 「기타」로 받는다 */
function ReasonExample() {
  const [value, setValue] = useState<string[]>([])
  return (
    <ChipGroup
      label="그렇게 생각한 이유"
      size="small"
      value={value}
      onChange={setValue}
      options={[
        { value: 'a', label: '답변이 부정확함' },
        { value: 'b', label: '출처가 적절하지 않음' },
        { value: 'c', label: '질문을 이해하지 못함' },
        { value: 'd', label: '답변이 너무 길거나 짧음' },
        { value: 'e', label: '화면 또는 기능 오류' },
        { value: 'f', label: '기타' },
      ]}
    />
  )
}

export const Reasons: Story = {
  name: '다중 선택 (피드백 사유)',
  render: () => <ReasonExample />,
}

/** 반드시 하나가 켜져 있는 축. 붙은 세그먼트라 「하나만」이 모양으로 읽힌다 */
function SingleExample() {
  const [value, setValue] = useState('md')
  return (
    <ChipGroup
      label="화면 크기"
      name="story-scale"
      size="small"
      single
      value={value}
      onChange={setValue}
      options={[
        { value: 'sm', label: '작게' },
        { value: 'md', label: '보통' },
        { value: 'lg', label: '크게' },
      ]}
    />
  )
}

export const Single: Story = {
  name: '단일 선택 (세그먼트)',
  render: () => <SingleExample />,
}

/** 지우는 대신 잠근다 — 목록에서 빼면 앞으로 생길 갈래가 있다는 사실까지 사라진다 */
function LockedExample() {
  const [value, setValue] = useState<string[]>([])
  return (
    <ChipGroup
      label="질문 형태"
      size="small"
      value={value}
      onChange={setValue}
      options={[
        { value: 'text', label: '글' },
        { value: 'voice', label: '음성 (준비 중)', disabled: true },
        { value: 'file', label: '파일 (준비 중)', disabled: true },
      ]}
    />
  )
}

export const Locked: Story = {
  name: '잠긴 낱개 포함',
  render: () => <LockedExample />,
}
