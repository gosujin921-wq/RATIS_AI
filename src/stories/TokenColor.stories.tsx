import type { Meta, StoryObj } from '@storybook/react-vite'
import { Group, Ramp, Swatch } from './token-preview'

/**
 * 색 토큰 — **`ratis-tokens.css` 가 정본이다.**
 *
 * 종전에는 값이 KRDS 이름 안에 부어져 있었고(`--ratis-blue-50`) 우리 부품이
 * 그 이름을 읽었다. 지금은 반대다. 우리 토큰이 값을 갖고, 킷이 남아 있는 동안만 브리지
 * 파일이 KRDS 이름에 먹인다.
 *
 * **램프를 직접 읽지 말고 시맨틱을 읽는다.** 번호를 부르면 「왜 이 색인가」가 사라진다.
 * 램프는 시맨틱이 없는 새 자리를 만들 때만 본다.
 *
 * KRDS 를 벗어나도 **대비 기준은 지킨다** — 본문 4.5:1 · 큰 글자 3:1 (요구사항 §11).
 * 흰 배경에서 글자로 쓸 수 있는 하한을 램프마다 주석으로 적어 두었다.
 */
const meta = {
  title: '토큰/색',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** 뜻으로 부르는 이름. 부품은 되도록 이쪽만 읽는다 */
export const Semantic: Story = {
  name: '시맨틱',
  render: () => (
    <div style={{ maxWidth: '64rem' }}>
      <Group title="면">
        <Swatch name="--ratis-surface-page" note="앱 바탕" />
        <Swatch name="--ratis-surface-card" note="대화 판 · 카드" />
        <Swatch name="--ratis-surface-raised" note="팝오버 · 모달" />
        <Swatch name="--ratis-surface-sunken" note="도구 줄 · 눌린 자리" />
        <Swatch name="--ratis-surface-hover" note="줄 호버" />
        <Swatch name="--ratis-surface-tint" note="선택된 줄" />
      </Group>
      <Group title="선">
        <Swatch name="--ratis-border-subtle" note="카드 · 구분선" />
        <Swatch name="--ratis-border-default" note="입력 · 셀렉트" />
        <Swatch name="--ratis-border-strong" />
        <Swatch name="--ratis-border-brand" />
      </Group>
      <Group title="글자">
        <Swatch name="--ratis-text-strong" note="제목 · 값" />
        <Swatch name="--ratis-text-body" note="본문" />
        <Swatch name="--ratis-text-muted" note="보조 설명" />
        <Swatch name="--ratis-text-subtle" note="캡션 · 묶음 이름 (본문 하한 4.75:1)" />
        <Swatch name="--ratis-text-disabled" />
        <Swatch name="--ratis-text-brand" />
      </Group>
      <Group title="주 실행 — 한 곳에서만 정한다">
        <Swatch name="--ratis-action-fill" note="보내기 · primary 버튼" />
        <Swatch name="--ratis-action-fill-hover" />
        <Swatch name="--ratis-action-fill-pressed" note="65 — 대비 때문에 만든 커스텀 슬롯" />
      </Group>
      <Group title="상태 — 면 · 선 · 글자 세 벌">
        <Swatch name="--ratis-danger-surface" />
        <Swatch name="--ratis-danger-border" />
        <Swatch name="--ratis-danger-text" />
        <Swatch name="--ratis-warning-surface" />
        <Swatch name="--ratis-warning-border" />
        <Swatch name="--ratis-warning-text" note="amber-60 — 5.02:1 로 본문 가능" />
        <Swatch name="--ratis-success-surface" />
        <Swatch name="--ratis-success-border" />
        <Swatch name="--ratis-success-text" />
        <Swatch name="--ratis-info-surface" />
        <Swatch name="--ratis-info-border" />
        <Swatch name="--ratis-info-text" />
      </Group>
    </div>
  ),
}

/** 원시 램프. 번호가 곧 밝기다 */
export const Ramps: Story = {
  name: '램프',
  render: () => (
    <div style={{ maxWidth: '64rem' }}>
      <Ramp prefix="gray" steps={[0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100]} />
      <Ramp prefix="blue" steps={[5, 10, 20, 30, 40, 45, 50, 60, 70, 80, 90, 95]} />
      <Ramp prefix="green" steps={[5, 10, 20, 30, 40, 50, 60, 65, 70, 80, 90]} />
      <Ramp prefix="navy" steps={[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]} />
      <Ramp prefix="red" steps={[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]} />
      <Ramp prefix="amber" steps={[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]} />
      <Ramp prefix="emerald" steps={[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]} />
      <Ramp prefix="graphic" steps={[10, 30, 50, 70, 90]} />
      <Group title="teal — 장식 전용">
        <Swatch name="--ratis-teal-50" note="입력창 스윕 · 바탕 워시. 글자·테두리 금지" />
      </Group>
    </div>
  ),
}
