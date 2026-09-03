/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // RATIS_AI 전용 고정 포트. KISA 5200, IDC 5300, NDMS 5400, CSMS 5500 이 이미 잡혀 있어
    // 5600 으로 못박고, strictPort 로 조용히 밀리지 않게 한다.
    port: 5600,
    strictPort: true,
    // 같은 Wi-Fi 의 휴대폰에서 열어 본다. 기본값(localhost)이면 이 기기 밖에서 안 잡힌다.
    // 브라우저 개발자도구의 모바일 흉내로는 실제 스크롤바·주소창·터치 타깃을 못 본다.
    host: true
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});