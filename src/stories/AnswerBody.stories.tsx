import type { Meta, StoryObj } from '@storybook/react-vite'
import { AnswerBody } from '../components/custom/AnswerBody'

/**
 * AI 답변 본문. 한 덩이 글에서 제목·목록·표·인용을 알아보고 그린다.
 *
 * 답변이 어떤 형태로 올지 화면은 미리 알 수 없다 (기획 §7). 그래서 본문 렌더러가
 * **모든 형태를 한 부품 안에서** 진다 — 형태마다 다른 자리를 만들면 답변이 섞여 올 때
 * 무엇이 어디에 서는지 화면이 매번 갈린다.
 *
 * 표는 화면보다 넓으면 제 상자 안에서 가로로 민다. 페이지가 옆으로 밀리지 않는다 (기획 §11).
 */
const meta = {
  title: 'AI chat/대화/AnswerBody',
  component: AnswerBody,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: '72rem' }}><Story /></div>],
} satisfies Meta<typeof AnswerBody>

export default meta
type Story = StoryObj<typeof meta>

export const Plain: Story = {
  name: '문단',
  args: {
    text: [
      '2024년 국내 방사선 이용기관은 총 9,132개소로 전년(8,874개소) 대비 약 2.9% 증가했습니다.',
      '',
      '분야별로는 산업체가 5,410개소로 가장 큰 비중을 차지했고, 의료기관 2,180개소, 연구기관 830개소, 교육기관 712개소 순입니다.',
    ].join('\n'),
  },
}

export const Structured: Story = {
  name: '제목 · 목록',
  args: {
    text: [
      '## 분야별 증감',
      '',
      '- 산업체는 149개소 늘어 증가분의 절반을 넘습니다.',
      '- 의료기관은 85개소 늘었습니다.',
      '- 연구기관과 교육기관은 거의 변동이 없습니다.',
      '',
      '### 집계 기준',
      '',
      '1. 조사 기준일은 매년 12월 31일입니다.',
      '2. 겸직자는 주 업무 기준으로 한 번만 셉니다.',
    ].join('\n'),
  },
}

export const WithTable: Story = {
  name: '표 · 인용',
  args: {
    text: [
      '연도별 기관 수는 다음과 같습니다.',
      '',
      '| 구분 | 2022 | 2023 | 2024 |',
      '| --- | --- | --- | --- |',
      '| 산업체 | 5,102 | 5,261 | 5,410 |',
      '| 의료기관 | 2,004 | 2,095 | 2,180 |',
      '| 합계 | 8,602 | 8,874 | 9,132 |',
      '',
      '> 단위: 개소 · 출처: 2024 방사선산업 실태조사 (한국방사선진흥협회)',
    ].join('\n'),
  },
}

/** 칸이 많은 표. 상자 안에서만 가로로 밀리는지 확인하는 자리다 */
export const WideTable: Story = {
  name: '넓은 표',
  decorators: [(Story) => <div style={{ maxWidth: '48rem' }}><Story /></div>],
  args: {
    text: [
      '| 시도 | 2020 | 2021 | 2022 | 2023 | 2024 | 증감 | 비중 |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      '| 경기 | 1,905 | 1,988 | 2,032 | 2,081 | 2,140 | +59 | 23.4% |',
      '| 서울 | 1,470 | 1,502 | 1,528 | 1,552 | 1,580 | +28 | 17.3% |',
      '| 경남 | 640 | 662 | 681 | 698 | 720 | +22 | 7.9% |',
    ].join('\n'),
  },
}
