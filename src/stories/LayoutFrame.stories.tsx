import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
/* 골격이 **실제 화면과 같은 규칙 위에** 서도록 화면 CSS 를 그대로 싣는다.
   여기서 폭·간격을 다시 적으면 그 순간부터 이 판은 화면이 아니라 그림이 된다 */
import '../app/AppShell.css'
import '../components/custom/Sidebar.css'
import '../components/custom/ConversationList.css'
import '../pages/chat/ChatPage.css'
import '../components/custom/SourcePanel.css'

/**
 * 전체 레이아웃 — 이용자 화면의 **골격**.
 *
 * 안을 비우고 자리만 세운다. 대화 내용과 상태(대화 중 · 대기 · 오류)는 화면 시나리오
 * 스토리북(5602)이 진다. 여기서 묻는 것은 하나다 — **무엇이 어디에 서고, 어디까지가
 * 그 자리의 몫인가.**
 *
 * ★ **치수를 손으로 적지 않는다.** 칸에 붙은 숫자는 그 순간 렌더된 상자를 실제로 잰
 *   값이다 (토큰 카탈로그와 같은 규칙). CSS 를 고치면 이 판의 숫자도 따라 바뀌므로
 *   골격 문서가 옛 값을 들고 남을 방법이 없다.
 * ★ 칸을 두르는 선은 `outline` 이다. 자리를 먹지 않아 골격의 치수를 흔들지 않는다.
 *
 * 이 판이 말하는 규칙
 *   ① 면을 가진 상자는 **대화 카드 하나뿐이다.** 사이드바는 면을 깔지 않아 바탕이 비친다
 *   ② 세로로 구르는 곳은 **둘뿐이다** — 대화 목록과 대화 스트림. 창은 구르지 않는다
 *   ③ 스트림과 입력 도크는 **같은 폭**을 공유한다
 *   ④ 원문 패널은 대화를 덮지 않고 폭을 나눠 갖는다 (좁아지면 덮되 대화는 살아 있다)
 */

/** 칸을 두르고 이름표를 앉히는 데만 쓰는 껍데기. 골격의 치수에는 손대지 않는다 */
const FRAME_CSS = `
.frame [data-slot] { outline: 1px dashed var(--ratis-gray-30); outline-offset: -1px; }
.frame [data-slot='scroll'] { outline-color: var(--ratis-blue-40); }
.frame [data-slot='list'] { outline-color: var(--ratis-blue-40); }
.frame .frame-tag {
  display: inline-flex; flex-direction: column; gap: 0.2rem; margin: 0.8rem;
  padding: 0.6rem 0.8rem; border-radius: var(--ratis-radius-tag);
  background: var(--ratis-gray-0); border: 1px solid var(--ratis-gray-20);
  font-size: 1.2rem; line-height: 1.45; color: var(--ratis-gray-70); text-align: left;
}
.frame .frame-tag strong { font-size: 1.3rem; color: var(--ratis-gray-90); }
.frame .frame-tag code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 1.2rem; color: var(--ratis-blue-60);
}
`

/** 상자를 실제로 잰다. 창을 늘리면 숫자도 따라 움직인다 */
function useBox(ref: RefObject<HTMLElement | null>) {
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => setBox({ w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) })
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return box
}

/** 잰 값은 px 와 rem 을 함께 적는다 — 이 앱은 1rem = 10px 다 (index.css) */
const size = (n: number) => `${n}px · ${(n / 10).toFixed(1)}rem`

/**
 * 칸 하나의 이름표 — 이름 · 잰 값 · 그 자리의 규칙 한 줄.
 * `axis` 로 무엇을 잰 값인지 가른다. 세로로 긴 칸에 폭만 적으면 읽는 쪽이 헷갈린다.
 */
function Tag({
  name,
  rule,
  box,
  axis = 'w',
}: {
  name: string
  rule?: ReactNode
  box?: { w: number; h: number } | null
  axis?: 'w' | 'h' | 'both'
}) {
  const measured = !box
    ? null
    : axis === 'w'
      ? `너비 ${size(box.w)}`
      : axis === 'h'
        ? `높이 ${size(box.h)}`
        : `${size(box.w)} × ${size(box.h)}`
  return (
    <span className="frame-tag">
      <strong>{name}</strong>
      {measured && <code>{measured}</code>}
      {rule && <span>{rule}</span>}
    </span>
  )
}

/** 지금 창이 어느 분기에 있는지 — 분기점을 베껴 적는 대신 **지금 걸린 것을 읽는다** */
function useBranch() {
  const [w, setW] = useState(() => window.innerWidth)
  useEffect(() => {
    const on = () => setW(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  const name =
    w >= 1280
      ? '원문 패널이 대화 옆에 붙는 분할 뷰'
      : w >= 1024
        ? '사이드바는 제자리 · 원문 패널은 대화 위 오버레이'
        : w >= 768
          ? '사이드바가 서랍으로 들어간다 (머리 줄이 선다)'
          : '원문 패널이 전체 폭을 쓴다'
  return { w, name }
}

function LayoutFrame({ collapsed, source }: { collapsed: boolean; source: boolean }) {
  const sideRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)

  const side = useBox(sideRef)
  const list = useBox(listRef)
  const main = useBox(mainRef)
  const scroll = useBox(scrollRef)
  const inner = useBox(innerRef)
  const dock = useBox(dockRef)
  const panel = useBox(panelRef)
  const branch = useBranch()

  return (
    <div className="ratis-shell frame">
      <style>{FRAME_CSS}</style>

      <div className="ratis-body">
        {/* 좁은 화면 전용 머리 줄 — 1023 이하에서만 CSS 가 세운다 */}
        <div className="ratis-topbar" data-slot="topbar">
          <Tag name="머리 줄" rule="좁은 화면에서만 선다 · 서랍을 여는 자리" />
        </div>

        {/* ── 사이드바 ────────────────────────────────────────────────── */}
        <div className="ratis-side" ref={sideRef} data-collapsed={collapsed || undefined}>
          <div className="ratis-head" data-slot="head" />
          {/* ★ 이름표는 **펼친 상태에서만** 세운다. 레일(72px)에 글자를 넣으면 한 글자씩
              접혀 골격이 아니라 찌그러진 글자 더미가 된다. 레일에서 잰 값은 오른쪽 아래
              줄이 대신 말한다 */}
          {!collapsed && <Tag name="사이드바" rule="면 없음 · 바탕이 그대로 비친다" box={side} />}
          <div data-slot="rows" style={{ margin: '0 1.2rem', height: '8.8rem' }}>
            {!collapsed && <Tag name="조작 줄" rule="새 대화 · 대화 검색" />}
          </div>
          {/* 실제 목록과 같은 클래스다 — 스크롤 규칙을 여기서 다시 적지 않는다.
              레일에서는 이 목록이 통째로 걷힌다 (Sidebar.css) */}
          <div className="conv-list" ref={listRef} data-slot="list">
            {!collapsed && (
              <Tag name="대화 목록" rule="스크롤 ② · 남는 높이를 먹는다" box={list} axis="both" />
            )}
          </div>
          <div data-slot="user" style={{ margin: '0 1.2rem 1.2rem', height: '6.4rem' }}>
            {!collapsed && <Tag name="회원 블록" rule="사이드바 맨 아래 고정" />}
          </div>
        </div>

        {/* ── 대화 카드 — 이 화면에서 면을 가진 유일한 상자 ───────────── */}
        <main className="ratis-main" ref={mainRef}>
          <div className="chat-layout" data-source={source ? 'open' : undefined}>
            <div className="chat-page">
              <div className="chat-scroll" ref={scrollRef} data-slot="scroll">
                <div className="chat-inner" ref={innerRef} data-slot="inner">
                  <Tag
                    name="대화 스트림"
                    rule="스크롤 ① · 이 카드에서 세로로 구르는 유일한 자리"
                    box={scroll}
                    axis="both"
                  />
                  <Tag
                    name="공유 폭 (chat-inner)"
                    rule="스트림과 입력 도크가 같은 값을 쓴다"
                    box={inner}
                  />
                </div>
              </div>

              <div className="chat-dock" ref={dockRef} data-slot="dock">
                <div className="chat-inner">
                  <Tag
                    name="입력 도크"
                    rule="하단 고정 · 스트림과 같은 폭 · 스크롤 밖"
                    box={dock}
                    axis="h"
                  />
                </div>
              </div>
            </div>

            {source && (
              <aside className="src-panel" ref={panelRef} data-slot="panel" aria-label="원문 패널 자리">
                <Tag
                  name="원문 패널"
                  rule="대화를 덮지 않고 폭을 나눈다 · 좁아지면 덮되 대화는 살아 있다"
                  box={panel}
                />
              </aside>
            )}
          </div>

          <p className="ratis-notice">전역 고지 한 줄 — 카드 안쪽 맨 아래, 스크롤 밖</p>
        </main>
      </div>

      {/* 지금 걸린 분기. 창을 줄이면 이 줄과 골격이 함께 바뀐다 */}
      <div
        className="frame-tag"
        style={{ position: 'absolute', right: '1.2rem', bottom: '1.2rem', zIndex: 30 }}
      >
        <strong>창 {branch.w}px</strong>
        <span>{branch.name}</span>
        <span>
          사이드바 {side ? size(side.w) : '—'}
          {collapsed && ' (레일)'}
        </span>
        <span>대화 카드 {main ? size(main.w) : '—'}</span>
      </div>
    </div>
  )
}

const meta = {
  title: 'AI chat/전체 레이아웃',
  component: LayoutFrame,
  parameters: {
    layout: 'fullscreen',
    /* 바탕은 앱 자신의 그러데이션(index.css 의 body)이다. 배경 도구가 흰 면을 덮으면
       「면을 가진 상자는 대화 카드 하나뿐」이라는 규칙이 눈에서 사라진다 */
    backgrounds: { disable: true },
  },
  argTypes: {
    collapsed: { name: '사이드바 접힘 (레일)' },
    source: { name: '원문 패널 열림' },
  },
  args: { collapsed: false, source: false },
} satisfies Meta<typeof LayoutFrame>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 창을 늘였다 줄이며 본다. 숫자는 그때그때 잰 값이고, 오른쪽 위 줄이 지금 걸린 분기를
 * 말한다. 사이드바 접힘 · 원문 패널은 컨트롤로 열고 닫는다.
 */
export const Frame: Story = { name: '골격' }
