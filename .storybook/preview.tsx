import type { Preview } from '@storybook/react-vite'

/**
 * 앱(src/main.tsx)이 읽는 것과 **같은 목록 · 같은 차례**여야 한다.
 * 한 줄이라도 빠지거나 순서가 바뀌면 스토리북에서만 값이 달라지는데, 뒤 파일이
 * 앞 파일의 값을 calc 로 쓰는 자리는 값이 조금 어긋나는 것이 아니라 **선언이 통째로
 * 사라지는** 방식이라 눈으로도 잘 안 잡힌다.
 *
 * 폰트는 .storybook/preview-head.html 이 public/fonts 에서 싣는다.
 */
import '../src/styles/ratis-tokens.css'
import '../src/styles/ratis-domain.css'
import '../src/styles/ratis-effects.css'
import '../src/index.css'
import '../src/styles/ratis-optical.css'

const preview: Preview = {
  parameters: {
    layout: 'padded',
    /**
     * 사이드바 차례를 못박는다 (2026-09-03).
     *
     *   공통 컴포넌트  화면 갈래를 안 가리는 부품. 어느 화면에서든 같은 뜻으로 선다
     *   AI chat        사용자용 챗봇 화면. 「전체 레이아웃」이 먼저 서고 그 아래 부품이 온다
     *   관리자 페이지   관리자 화면의 부품
     *
     * AI chat 안에서 「전체 레이아웃」을 맨 앞에 둔다 — 부품이 어느 자리에 서는 것인지
     * 먼저 보고 낱개를 봐야 그 부품이 무엇을 위한 것인지 읽힌다.
     *
     * 이름순으로 두면 라틴이 앞서 「AI chat」이 맨 위로 올라간다. 사전(공통)을 먼저 보고
     * 화면 부품을 뒤에 보는 차례라야 「이건 공통에 이미 있나」를 먼저 묻게 된다.
     */
    options: {
      storySort: {
        order: ['토큰', '공통 컴포넌트', 'AI chat', ['전체 레이아웃', '사이드바', '대화'], '관리자 페이지'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        light: { name: 'Light', value: '#ffffff' },
        gray: { name: 'Gray', value: '#f4f5f6' },
      },
    },
    a11y: { test: 'todo' },
  },
  initialGlobals: {
    backgrounds: { value: 'light' },
  },
}

export default preview
