import { useId } from 'react'
import {
  Bar,
  BarChart as RcBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cx } from './util'
import './BarChart.css'

export interface PairTrendDatum {
  /** 가로축 라벨 (날짜·월 등) */
  label: string
  /** 앞세우는 계열 — 진한 막대 */
  main: number
  /** 견주는 계열 — 연한 막대 */
  sub: number
}

/**
 * 두 흐름 추이 차트 — 성격이 다른 두 값을 같은 기간 축 위에 나란히 세운다.
 * 그림은 Recharts 로 그린다.
 *
 * `TrendChart` 와 무엇이 다른가 — 그쪽은 **한 값의 신규와 누적**이라 두 계열이 포함 관계고,
 * 그래서 막대(신규) 위에 선(누적)이 선다. 이쪽 두 계열은 서로를 품지 않는다 (다운로드
 * 신청 건수와 시도 건수처럼 각각 세는 값이다). 포함 관계가 아닌 것을 막대와 선으로 그리면
 * 선이 막대의 합계로 읽히므로 **막대 둘을 나란히** 세운다.
 *
 * 색은 둘뿐이라 뜻으로 가른다 — 화면이 앞세우는 계열이 진하고(primary-40 · 추이 차트의
 * 신규 막대와 같은 색), 견주는 계열이 연하다(primary-20). 무엇을 앞세울지는 화면이 정한다.
 */
export function PairTrendChart({
  data,
  caption,
  mainLabel,
  subLabel,
  unit = '건',
  height = 280,
  animate = true,
  showLegend = true,
  className,
}: {
  data: PairTrendDatum[]
  /** 차트가 무엇을 보여주는지 (보조기술용). 화면에는 보이지 않는다 */
  caption: string
  mainLabel: string
  subLabel: string
  unit?: string
  height?: number
  /** false 면 등장 애니메이션 없이 완성 상태로 그린다 */
  animate?: boolean
  /** false 면 그림 안에 범례를 안 그린다 — 제목 줄로 올린 화면은 `PairTrendLegend` 를 쓴다 */
  showLegend?: boolean
  className?: string
}) {
  const descId = useId()
  return (
    <>
      <div className={cx('ratis-chart', className)} role="img" aria-label={caption} aria-describedby={descId}>
        <ResponsiveContainer width="100%" height={height}>
          <RcBarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }} barGap={2}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} width={56} />
            <Tooltip
              cursor={{ fill: 'var(--ratis-gray-5)' }}
              formatter={(v, name) => [`${Number(v).toLocaleString()}${unit}`, name]}
              contentStyle={{
                borderRadius: '0.8rem',
                border: '1px solid var(--ratis-gray-20)',
                fontSize: '1.4rem',
              }}
            />
            {/* 범례는 그림 상단 우측 — 추이 차트와 같은 자리 문법이다 */}
            {showLegend && (
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8 }} />
            )}
            {/* 앞세우는 계열을 먼저 그린다 — 범례에서도 이 차례로 선다 */}
            <Bar
              dataKey="main"
              name={mainLabel}
              fill="var(--ratis-blue-40)"
              radius={[6, 6, 0, 0]}
              barSize={14}
              isAnimationActive={animate}
              animationDuration={1200}
            />
            <Bar
              dataKey="sub"
              name={subLabel}
              fill="var(--ratis-blue-20)"
              radius={[6, 6, 0, 0]}
              barSize={14}
              isAnimationActive={animate}
              animationDuration={1200}
            />
          </RcBarChart>
        </ResponsiveContainer>
      </div>
      {/* ★ 그림이 말하는 값을 글로도 둔다. `role="img"` 가 안을 통째로 감춰 이름(caption)만으로는
          값이 하나도 전해지지 않는다 — 이름과 갈라 설명(describedby)으로 두는 까닭은 design.md §15.
          구간마다 두 계열 값 */}
      <p id={descId} className="visually-hidden">
        {data
          .map(
            (d) =>
              `${d.label} ${mainLabel} ${d.main.toLocaleString()}${unit}, ${subLabel} ${d.sub.toLocaleString()}${unit}`,
          )
          .join(' / ')}
      </p>
    </>
  )
}

/**
 * 두 흐름 추이 범례 — **그림 밖**에 세울 때 쓴다 (카드 제목 줄 등).
 * 표식은 그림이 쓰는 어휘 그대로 둥근 막대 둘이고, 진하기로 계열을 가른다.
 *
 * 쓰는 쪽은 짝이 되는 `PairTrendChart` 에 `showLegend={false}` 를 함께 준다 —
 * 안 그러면 범례가 둘이 된다.
 */
export function PairTrendLegend({
  mainLabel,
  subLabel,
  className,
}: {
  mainLabel: string
  subLabel: string
  className?: string
}) {
  return (
    <ul className={cx('ratis-chart-legend', className)}>
      <li>
        <span aria-hidden className="mark bar" />
        {mainLabel}
      </li>
      <li>
        <span aria-hidden className="mark bar soft" />
        {subLabel}
      </li>
    </ul>
  )
}
