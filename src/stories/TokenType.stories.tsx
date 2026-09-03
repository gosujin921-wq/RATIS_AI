import type { Meta, StoryObj } from '@storybook/react-vite'
import { Group, useToken } from './token-preview'

/**
 * 타이포 토큰.
 *
 * **본문 축과 컨트롤 축은 다르다.** 컨트롤 글자(`--ratis-control-font-*`)는 자기 높이에
 * 매인 값이고, 여기 있는 것은 읽는 글의 크기다. 둘을 섞으면 버튼 글자를 키우려다
 * 본문이 따라 커진다.
 *
 * **굵기 상한은 600 이다.** 위계는 굵기가 아니라 크기·색으로 만든다. 표 헤더처럼 죽일
 * 요소는 굵기(500)보다 색으로 죽인다.
 */
const meta = { title: '토큰/타이포', tags: ['autodocs'], parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function TypeRow({ name, note }: { name: string; note: string }) {
  const value = useToken(name)
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.6rem', padding: '0.6rem 0' }}>
      <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '1.2rem', width: '17rem' }}>
        {name}
      </code>
      <code
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: '1.2rem',
          width: '5rem',
          color: 'var(--ratis-text-subtle)',
        }}
      >
        {value}
      </code>
      <span style={{ fontSize: `var(${name})`, color: 'var(--ratis-text-body)' }}>
        방사선 이용기관 현황
      </span>
      <span style={{ fontSize: '1.2rem', color: 'var(--ratis-text-subtle)' }}>{note}</span>
    </div>
  )
}

export const Sizes: Story = {
  name: '크기',
  render: () => (
    <Group title="본문 축">
      <TypeRow name="--ratis-font-xs" note="캡션 · 출처 경로 · 단위" />
      <TypeRow name="--ratis-font-sm" note="보조 문구 · 칩 · 안내 한 줄" />
      <TypeRow name="--ratis-font-md" note="본문 기본 · 목록 줄" />
      <TypeRow name="--ratis-font-lg" note="답변 본문" />
      <TypeRow name="--ratis-font-xl" note="소제목" />
      <TypeRow name="--ratis-font-2xl" note="제목" />
      <TypeRow name="--ratis-font-3xl" note="페이지 제목" />
      <TypeRow name="--ratis-font-4xl" note="시작 화면 큰 제목" />
    </Group>
  ),
}

export const Weights: Story = {
  name: '굵기',
  render: () => (
    <Group title="상한 600 — 700 이상은 쓰지 않는다">
      {[
        ['--ratis-weight-normal', '본문'],
        ['--ratis-weight-medium', '보조 강조 — 배지 · 표 헤더'],
        ['--ratis-weight-bold', '강조 전부 — 버튼 · 칩 · 라벨 · 제목'],
      ].map(([name, note]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: '1.6rem', padding: '0.6rem 0' }}>
          <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '1.2rem', width: '20rem' }}>
            {name}
          </code>
          <span style={{ fontSize: '1.5rem', fontWeight: `var(${name})` as never }}>
            방사선 이용기관 현황
          </span>
          <span style={{ fontSize: '1.2rem', color: 'var(--ratis-text-subtle)' }}>{note}</span>
        </div>
      ))}
    </Group>
  ),
}
