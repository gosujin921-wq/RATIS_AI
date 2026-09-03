import type { Meta, StoryObj } from '@storybook/react-vite'
import { Group, SizeRow, useToken } from './token-preview'

/**
 * 치수 토큰 — 간격 · 라운드 · 컨트롤 사다리.
 *
 * **크기를 자리마다 적지 않는다.** 종전에는 높이를 서른 군데에 직접 적어 뒀고, 모바일
 * 대응이 필요해지자 파일 다섯 곳에 767 블록이 따로 생겼다. 값은 한 벌뿐이고 자리에서는
 * 급만 고른다.
 *
 * 라운드는 design.md §7 위계를 그대로 옮긴 것이다. 명령(누르는 것)은 캡슐, 내용 상자는
 * control, 표면은 surface. 한 요소에서 바깥보다 안쪽 라운드가 크면 안 된다.
 */
const meta = {
  title: '토큰/치수',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Space: Story = {
  name: '간격',
  render: () => (
    <Group title="4 배수 사다리">
      {[2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40].map((n) => (
        <SizeRow key={n} name={`--ratis-space-${n}`} />
      ))}
    </Group>
  ),
}

/** 라운드는 막대가 아니라 모서리로 봐야 한다 */
function RadiusBox({ name, note }: { name: string; note: string }) {
  const value = useToken(name)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', minHeight: '5.6rem' }}>
      <span
        style={{
          flex: 'none',
          width: '7.2rem',
          height: '4.4rem',
          borderRadius: `var(${name})`,
          border: '1px solid var(--ratis-border-default)',
          background: 'var(--ratis-surface-sunken)',
        }}
      />
      <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '1.2rem', width: '20rem' }}>
        {name}
      </code>
      <code
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: '1.2rem',
          width: '6rem',
          color: 'var(--ratis-text-subtle)',
        }}
      >
        {value}
      </code>
      <span style={{ fontSize: '1.2rem', color: 'var(--ratis-text-subtle)' }}>{note}</span>
    </div>
  )
}

export const Radius: Story = {
  name: '라운드',
  render: () => (
    <Group title="§7 라운드 위계">
      <RadiusBox name="--ratis-radius-tag" note="사각 태그 · 목록 항목" />
      <RadiusBox name="--ratis-radius-control" note="입력 · 셀렉트 · 아이콘 버튼 · 사이드바 줄" />
      <RadiusBox name="--ratis-radius-pop" note="팝오버 · 셀렉트 목록 · 피드백 상자" />
      <RadiusBox name="--ratis-radius-surface" note="카드 · 표 셸 · 모달 · 본문 판" />
      <RadiusBox name="--ratis-radius-panel" note="큰 패널 · 미디어" />
      <RadiusBox name="--ratis-radius-max" note="캡슐 — 버튼 · 칩 · 배지 · 검색창" />
    </Group>
  ),
}

/**
 * 컨트롤 사다리 — 버튼·입력·셀렉트·검색창·드롭다운이 전부 이 값을 가리킨다.
 * **lg(52)는 쓰지 않는다** (2026-09-03). 화면을 끝내는 제출 버튼이 없는 서비스다.
 */
export const Control: Story = {
  name: '컨트롤 사다리',
  render: () => (
    <>
      <Group title="높이 · 글자 · 좌우 여백">
        <SizeRow name="--ratis-control-height-sm" note="36 — 목록 줄 · 여럿이 나란히" />
        <SizeRow name="--ratis-control-height-md" note="44 — 구획 안의 액션" />
        <SizeRow name="--ratis-control-font-sm" />
        <SizeRow name="--ratis-control-font-md" />
        <SizeRow name="--ratis-control-padding-sm" />
        <SizeRow name="--ratis-control-padding-md" />
      </Group>
      <Group title="정사각 아이콘 버튼 — 박스와 글리프가 따로 움직인다">
        <SizeRow name="--ratis-iconbtn-box-sm" />
        <SizeRow name="--ratis-iconbtn-box-md" />
        <SizeRow name="--ratis-iconbtn-box-lg" />
        <SizeRow name="--ratis-iconbtn-glyph-sm" />
        <SizeRow name="--ratis-iconbtn-glyph-md" />
        <SizeRow name="--ratis-iconbtn-glyph-lg" />
      </Group>
    </>
  ),
}
