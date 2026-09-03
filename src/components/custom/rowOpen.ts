import type { KeyboardEvent, MouseEvent } from 'react'

/** 줄 안에서 **자기 몫의 조작을 가진** 것들. 여기서 시작한 클릭·키는 줄의 것이 아니다 */
const INTERACTIVE = 'a, button, input, select, textarea, label, [role="switch"], [role="button"]'

/**
 * 목록 표의 **줄이 창을 여는** 자리에 붙이는 속성 묶음.
 *
 * 왜 줄인가 — 목록에서 하는 일은 「이 건을 고른다」이지 「이 글자를 누른다」가 아니다.
 * 여는 자리를 글자 하나로 좁히면 표적이 작고, 줄마다 어느 값이 눌리는 값인지 찾아야 한다.
 * 「수정」 버튼 열을 따로 세우지 않는 것도 같은 이유다 — 열이 하나 늘고 손이 갈 자리가 둘이 된다.
 *
 * 마우스만 되면 안 되므로 줄이 초점을 받고 Enter·Space 로도 열린다. 스페이스는 기본이
 * 스크롤이라 막는다.
 *
 * ★ **줄 안에 남은 조작은 줄을 열지 않는다** — 삭제 버튼 · 차례 손잡이 · 노출 토글에서
 *   시작한 클릭과 키는 여기서 걸러 낸다. 화면마다 `stopPropagation` 을 손으로 다는 방식은
 *   한 곳만 빠뜨려도 「토글을 켰는데 수정 창이 뜨는」 일이 나므로 부품이 한 번에 맡는다.
 * ★ 줄이 여는 것은 **하나일 때만** 쓴다. 한 줄에서 갈 곳이 둘 이상이면 줄이 어느 쪽인지
 *   말할 수 없어 버튼을 남긴다.
 * ★ **다른 화면으로 가는 줄에는 쓰지 않는다.** 그건 링크라야 새 탭·주소 복사가 된다.
 */
export function openableRow(onOpen: () => void) {
  const fromInside = (e: { target: unknown; currentTarget: Element }) =>
    e.target instanceof Element && e.target !== e.currentTarget && e.target.closest(INTERACTIVE)

  return {
    className: 'ratis-row-open',
    tabIndex: 0,
    onClick: (e: MouseEvent<HTMLTableRowElement>) => {
      if (fromInside(e)) return
      onOpen()
    },
    onKeyDown: (e: KeyboardEvent<HTMLTableRowElement>) => {
      if (fromInside(e)) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onOpen()
      }
    },
  }
}
