import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

// 탭·사이드바 구분용. 화면 시나리오는 5602 가 맡는다
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'RATIS 컴포넌트 · 5601',
  }),
})
