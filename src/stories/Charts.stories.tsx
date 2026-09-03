import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarChart } from '../components/custom/BarChart'
import { PairTrendChart, PairTrendLegend } from '../components/custom/PairTrendChart'
import { TrendChart, TrendChartLegend } from '../components/custom/TrendChart'

const RANK = [
  { label: '교통사고', value: 268 },
  { label: '침수', value: 174 },
  { label: '산불', value: 96 },
  { label: '쓰러짐', value: 41 },
  { label: '기타', value: 0 },
]

const TREND = [
  { label: '4월', added: 120, total: 1240 },
  { label: '5월', added: 168, total: 1408 },
  { label: '6월', added: 96, total: 1504 },
  { label: '7월', added: 204, total: 1708 },
  { label: '8월', added: 152, total: 1860 },
]

const PAIR = [
  { label: '4월', main: 48, sub: 62 },
  { label: '5월', main: 71, sub: 88 },
  { label: '6월', main: 39, sub: 51 },
  { label: '7월', main: 92, sub: 110 },
  { label: '8월', main: 66, sub: 79 },
]

const meta = {
  title: '공통 컴포넌트/Charts',
  component: BarChart,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '64rem' }}><Story /></div>],
  args: { data: RANK, caption: '유형별 이벤트 건수' },
} satisfies Meta<typeof BarChart>

export default meta
type Story = StoryObj<typeof meta>

/** 항목별 크기 비교. 값의 크기가 곧 위계인 자리는 농도(shade)를 켠다 */
export const Rank: Story = {
  name: '순위 막대',
  render: () => (
    <BarChart data={RANK} caption="유형별 이벤트 건수" shade track maxGuide showValues />
  ),
}

/** 색이 뜻을 가지지 않으면 한 색이다 */
export const Plain: Story = {
  name: '한 색 막대',
  render: () => <BarChart data={RANK} caption="유형별 이벤트 건수" showValues />,
}

/** 신규(막대)와 누적(선). 자가 둘이라 두 그림의 높낮이를 서로 견주지 않는다 */
export const Trend: Story = {
  name: '추이',
  render: () => <TrendChart data={TREND} caption="월별 신규·누적 데이터 건수" />,
}

/** 범례를 카드 제목 줄로 올린 화면 — 그림 안 범례는 끈다 */
export const TrendLegendOutside: Story = {
  name: '추이 (범례 밖)',
  render: () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.6rem' }}>
        <TrendChartLegend />
      </div>
      <TrendChart data={TREND} caption="월별 신규·누적 데이터 건수" showLegend={false} />
    </>
  ),
}

/** 서로를 품지 않는 두 값 — 막대 둘을 나란히 세운다 */
export const Pair: Story = {
  name: '두 흐름',
  render: () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.6rem' }}>
        <PairTrendLegend mainLabel="신청" subLabel="시도" />
      </div>
      <PairTrendChart
        data={PAIR}
        caption="월별 다운로드 신청·시도 건수"
        mainLabel="신청"
        subLabel="시도"
        showLegend={false}
      />
    </>
  ),
}
