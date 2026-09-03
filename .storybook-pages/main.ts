import type { StorybookConfig } from '@storybook/react-vite'

/** 화면 시나리오 스토리북 (5602): 화면별 상태 · 케이스보드 확인용.
    컴포넌트 카탈로그는 기본 스토리북(.storybook, 5601)이 담당한다 */
const config: StorybookConfig = {
  stories: ['../src/stories/screens/**/*.mdx', '../src/stories/screens/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
}

export default config
