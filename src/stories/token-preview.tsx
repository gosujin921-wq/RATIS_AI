import { useEffect, useState, type CSSProperties } from 'react'

/**
 * 토큰 카탈로그용 조각들 — **값을 손으로 적지 않는다.**
 *
 * 화면에 뜬 실제 CSS 변수를 읽어 그린다. 카탈로그에 숫자를 베껴 두면 토큰을 고쳤을 때
 * 문서만 옛 값을 들고 남는다. 여기서는 문서가 틀릴 방법이 없다.
 */
export function useToken(name: string) {
  const [value, setValue] = useState('')
  useEffect(() => {
    setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim())
  }, [name])
  return value
}

const mono: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '1.2rem',
}

/** 색 한 칸 — 이름 · 실제 값 · 색면 */
export function Swatch({ name, note }: { name: string; note?: string }) {
  const value = useToken(name)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', minHeight: '3.6rem' }}>
      <span
        style={{
          flex: 'none',
          width: '4.8rem',
          height: '2.8rem',
          borderRadius: 'var(--ratis-radius-tag)',
          border: '1px solid var(--ratis-border-subtle)',
          background: `var(${name})`,
        }}
      />
      {/* 칸 폭을 고정한다 — 설명이 없는 줄에서 이름이 늘어나면 값 칸이 오른쪽으로 밀려
          위아래 줄의 값이 세로로 안 맞는다 (2026-09-03 실측) */}
      <code style={{ ...mono, width: '21rem', flex: 'none', color: 'var(--ratis-text-body)' }}>
        {name}
      </code>
      <code style={{ ...mono, width: '9rem', flex: 'none', color: 'var(--ratis-text-subtle)' }}>
        {value}
      </code>
      <span style={{ fontSize: '1.2rem', color: 'var(--ratis-text-subtle)', flex: 1 }}>{note}</span>
    </div>
  )
}

/** 램프 한 벌 */
export function Ramp({ prefix, steps }: { prefix: string; steps: (number | string)[] }) {
  return (
    <section style={{ marginBottom: '2.4rem' }}>
      <h3 style={{ margin: '0 0 0.8rem', fontSize: '1.4rem', color: 'var(--ratis-text-strong)' }}>
        {prefix}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {steps.map((s) => (
          <Swatch key={s} name={`--ratis-${prefix}-${s}`} />
        ))}
      </div>
    </section>
  )
}

/** 치수 한 줄 — 이름 · 값 · 그 값만큼의 막대 */
export function SizeRow({ name, note }: { name: string; note?: string }) {
  const value = useToken(name)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', minHeight: '3.2rem' }}>
      <code style={{ ...mono, width: '22rem', color: 'var(--ratis-text-body)' }}>{name}</code>
      <code style={{ ...mono, width: '6rem', color: 'var(--ratis-text-subtle)' }}>{value}</code>
      <span
        style={{
          height: '1.2rem',
          width: `var(${name})`,
          borderRadius: '0.2rem',
          background: 'var(--ratis-blue-30)',
        }}
      />
      {note && (
        <span style={{ fontSize: '1.2rem', color: 'var(--ratis-text-subtle)' }}>{note}</span>
      )}
    </div>
  )
}

/** 묶음 제목 */
export function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '3.2rem' }}>
      <h3
        style={{
          margin: '0 0 1rem',
          fontSize: '1.4rem',
          fontWeight: 600,
          color: 'var(--ratis-text-strong)',
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  )
}
