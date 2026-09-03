import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  /* 부품 카탈로그만 싣는다. `src/stories/screens/` 는 **화면 시나리오**라 5602
     (.storybook-pages)가 진다 — 여기까지 끌어오면 두 스토리북을 가른 뜻이 없어진다 */
  "stories": [
    "../src/**/*.mdx",
    "../src/components/**/*.stories.@(ts|tsx)",
    "../src/stories/*.stories.@(ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  "framework": "@storybook/react-vite",
  // public/ 을 그대로 서빙한다 — preview-head.html 이 여기 폰트를 가리킨다
  "staticDirs": ["../public"]
};
export default config;