import type { Meta, StoryObj } from '@storybook/react-vite'
import { Group, useToken } from './token-preview'

/**
 * 그림자 토큰.
 *
 * 종전에는 토큰이 **하나도 없었다.** 자리마다 손으로 적다 보니 같은 갈래인 사용자 메뉴와
 * 대화 줄 메뉴가 `0 6px 20px` 와 `0 4px 16px` 로 갈려 있었다 (2026-09-03 실측).
 *
 * 그림자는 **높이를 말한다.** 면 위에 얼마나 떠 있는지가 뜻이므로, 자리가 아니라 높이로
 * 이름을 붙인다.
 */
const meta = { title: '토큰/그림자', tags: ['autodocs'], parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function ShadowBox({ name, note }: { name: string; note: string }) {
  const value = useToken(name)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.6rem 0' }}>
      <span
        style={{
          flex: 'none',
          width: '12rem',
          height: '6rem',
          borderRadius: 'var(--ratis-radius-pop)',
          background: 'var(--ratis-surface-raised)',
          boxShadow: `var(${name})`,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '1.2rem' }}>{name}</code>
        <p style={{ margin: '0.4rem 0 0', fontSize: '1.2rem', color: 'var(--ratis-text-subtle)' }}>
          {note}
        </p>
        <code
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: '1.1rem',
            color: 'var(--ratis-text-disabled)',
          }}
        >
          {value}
        </code>
      </div>
    </div>
  )
}

export const All: Story = {
  name: '높이 세 단',
  render: () => (
    <Group title="면 위에 얼마나 떠 있는가">
      <ShadowBox name="--ratis-shadow-float" note="줄 위에 살짝 — 「새 답변」 버튼" />
      <ShadowBox name="--ratis-shadow-pop" note="팝오버 · 메뉴 — 눌러서 연 것" />
      <ShadowBox name="--ratis-shadow-panel" note="셀렉트 목록 · 판 — 화면을 덮는 것" />
    </Group>
  ),
}
