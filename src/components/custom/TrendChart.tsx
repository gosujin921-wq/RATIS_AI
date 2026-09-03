import { useId } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cx } from './util'
import './BarChart.css'

/**
 * 두 계열의 색. 범례를 차트 밖(머리 줄)에 놓을 때도 같은 색을 써야 해서 내보낸다 —
 * 색을 양쪽에 따로 적어 두면 한쪽만 바뀐다.
 */
export const TREND_COLORS = {
  added: 'var(--ratis-blue-40)',
  total: 'var(--ratis-blue-60)',
} as const

export interface TrendDatum {
  /** 가로축 라벨 (월 등) */
  label: string
  /** 막대 — 그 구간에 새로 생긴 양 */
  added: number
  /** 선 — 그때까지 쌓인 양 */
  total: number
}

/**
 * 추이 차트 — 구간별 신규(막대)와 누적(선)을 한 그림에 겹쳐 본다.
 * 그림은 Recharts 로 그린다.
 *
 * 신규는 막대, 누적은 선으로 고정한다. 둘 다 선이면 어느 쪽이 누적인지 읽기 어렵다.
 *
 * **축은 둘이다** (2026-09-01 사용자 확정). 왼쪽 자는 막대(신규), 오른쪽 자는 선(누적).
 * 누적이 신규보다 열 배 넘게 커서 한 자에 얹으면 막대가 바닥에 눌려 월별 증감이 안 보인다.
 * 자를 나누면 두 그림이 각자 제 높이를 쓴다.
 *
 * 대신 **두 그림의 높낮이를 서로 견주지 않는다** — 자가 다르니 선이 막대보다 아래로 내려가
 * 보이는 자리가 생길 수 있다. 이 그림은 왼쪽 자로 월별 증감을, 오른쪽 자로 쌓인 양을
 * 따로 읽는 그림이다. 정확한 값은 짚으면 말풍선이 알려준다.
 *
 * 눈금은 양쪽 다 0 에서 시작해 다섯 칸으로 끊는다 — 그래야 가로 격자선이 양쪽 자에
 * 똑같이 맞아떨어진다.
 */
export function TrendChart({
  data,
  caption,
  addedLabel = '신규',
  totalLabel = '누적',
  unit = '건',
  height = 280,
  layout = 'horizontal',
  animate = true,
  showLegend = true,
  className,
}: {
  data: TrendDatum[]
  /** 차트가 무엇을 보여주는지 (보조기술용) */
  caption: string
  addedLabel?: string
  totalLabel?: string
  unit?: string
  height?: number
  /**
   * vertical 이면 구간이 위에서 아래로 흐른다 (막대 가로 · 누적이 막대 길이).
   * 세로로 긴 그림(지도) 옆에 세울 때 키를 맞추는 변형 — "쌓인다" 는 뜻과도 결이 맞는다.
   * 자가 둘인 짜임은 가로형에만 있다 — 세로형은 누적을 막대 길이로 말해 자가 하나면 된다
   */
  layout?: 'horizontal' | 'vertical'
  /**
   * false 면 등장 애니메이션 없이 완성 상태로 그린다. 재생 시점을 밖에서 정하는 화면
   * (뷰포트 진입·오버레이 게이트)은 false → true 로 바꾸며 key 를 갈아 다시 태어나게 한다.
   */
  animate?: boolean
  /**
   * false 면 그림 안에 범례를 안 그린다. 범례를 **제목 줄로 올린 화면**이 쓴다 —
   * 그 자리는 `TrendChartLegend`(추이) · `ChartLegend`(임의 계열) 가 같은 어휘로 그린다
   */
  showLegend?: boolean
  className?: string
}) {
  const descId = useId()
  const vertical = layout === 'vertical'
  /* 세로형에서 누적은 **선이 아니라 막대 길이**다 (2026-09-02 화면 검토) — 시간이 아래로
     흐르는 채로 누적선을 그리면 우하향해 줄어드는 그림으로 읽히고, 순서를 뒤집으면 누적의
     논리가 깨진다. 막대 전체 길이 = 누적(직전 누적 연한 면 + 그달 신규 진한 조각)으로
     그리면 아래로 갈수록 길어지는 막대가 착시 없이 "쌓인다" 를 말한다 */
  const rows = vertical ? data.map((d) => ({ ...d, prev: d.total - d.added })) : data
  return (
    <>
      <div className={cx('ratis-chart', className)} role="img" aria-label={caption} aria-describedby={descId}>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={rows}
            layout={layout}
            margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
          >
            {vertical ? (
              <>
                <CartesianGrid vertical horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} width={44} />
              </>
            ) : (
              <>
            {/* 격자선은 왼쪽 자에 맞춰 긋는다 — 자가 둘이라 어느 쪽을 따를지 짚어 줘야 그어진다.
                양쪽 자 모두 0 에서 다섯 칸이라 오른쪽 눈금에도 그대로 맞는다 */}
            <CartesianGrid vertical={false} yAxisId="added" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} />
            {/* 왼쪽 자 — 막대(신규). 눈금 글자는 왼쪽 정렬이라 자릿수가 달라도 첫 글자가 한 줄에 선다.
                폭은 가장 긴 눈금 글자(세 자리 22) + 격자까지 8 = 30. dx 는 Recharts 가 글자를 축
                오른쪽 끝(폭-8)에 놓는 걸 왼쪽 끝으로 되돌린 값. 실측 자리라 토큰이 아니다 */}
            <YAxis
              yAxisId="added"
              axisLine={false}
              tickLine={false}
              width={30}
              domain={[0, 'auto']}
              tickCount={5}
              tick={{ textAnchor: 'start', dx: -22 }}
            />
            {/* 오른쪽 자 — 선(누적). 눈금 글자는 오른쪽 정렬이라 끝 글자가 한 줄에 선다.
                폭은 격자까지 8 + 가장 긴 눈금 글자(네 자리 29) = 37. dx 는 Recharts 가 글자를 축
                왼쪽 끝(8)에 놓는 걸 오른쪽 끝으로 밀어낸 값. 실측 자리라 토큰이 아니다 */}
            <YAxis
              yAxisId="total"
              orientation="right"
              axisLine={false}
              tickLine={false}
              width={37}
              domain={[0, 'auto']}
              tickCount={5}
              tick={{ textAnchor: 'end', dx: 29 }}
            />
              </>
            )}
            <Tooltip
              cursor={{ fill: 'var(--ratis-gray-5)' }}
              formatter={(v, name, item) => [
                /* 연한 면의 값은 직전 누적이라 그대로 보이면 틀린다 — 누적 이름엔 총 누적을 준다 */
                `${Number(name === totalLabel ? (item?.payload?.total ?? v) : v).toLocaleString()}${unit}`,
                name,
              ]}
              contentStyle={{
                borderRadius: '0.8rem',
                border: '1px solid var(--ratis-gray-20)',
                fontSize: '1.4rem',
              }}
            />
            {/* 범례는 그림 상단 우측 — 아래에 두면 축 라벨과 한 덩어리로 읽힌다 (2026-09-02 확정).
               세로형 차트에선 항목도 세로 블록으로 쌓아 지도 범례와 같은 자리 문법을 쓴다.
               카드 제목 줄로 올린 화면은 `showLegend={false}` 로 끄고 밖에 세운다 */}
            {showLegend &&
              (vertical ? (
                <Legend
                  layout="vertical"
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 8 }}
                />
              ) : (
                <Legend />
              ))}
            {vertical && (
              /* 직전 누적 — 연한 면. 위의 rows 주석 참조: 신규와 쌓여 막대 전체가 누적이 된다 */
              <Bar
                dataKey="prev"
                name={totalLabel}
                stackId="cum"
                /* 10 은 흰 바닥에서 안 보인다 — 한 단 올려 누적 면이 분명히 선다 */
                fill="var(--ratis-blue-20)"
                barSize={14}
                isAnimationActive={animate}
                animationDuration={1200}
              />
            )}
            <Bar
              dataKey="added"
              name={addedLabel}
              stackId={vertical ? 'cum' : undefined}
              yAxisId={vertical ? undefined : 'added'}
              fill={TREND_COLORS.added}
              radius={vertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}
              barSize={vertical ? 14 : 20}
              isAnimationActive={animate}
              animationDuration={1200}
            />
            {!vertical && (
              <Line
                yAxisId="total"
                type="monotone"
                dataKey="total"
                name={totalLabel}
                stroke={TREND_COLORS.total}
                strokeWidth={2}
                /* 달마다 원을 찍어 지점을 짚을 수 있게 한다. 흰 테를 둘러 선 위에 올라앉아 보이게 */
                dot={{
                  r: 4,
                  fill: TREND_COLORS.total,
                  stroke: 'var(--ratis-gray-0)',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: TREND_COLORS.total,
                  stroke: 'var(--ratis-gray-0)',
                  strokeWidth: 2,
                }}
                isAnimationActive={animate}
                animationDuration={1200}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* ★ 그림이 말하는 값을 글로도 둔다. `role="img"` 가 안을 통째로 감춰 이름(caption)만으로는
          값이 하나도 전해지지 않는다 — 이름과 갈라 설명(describedby)으로 두는 까닭은 design.md §15.
          구간마다 신규·누적 두 값 */}
      <p id={descId} className="visually-hidden">
        {data
          .map(
            (d) =>
              `${d.label} ${addedLabel} ${d.added.toLocaleString()}${unit}, ${totalLabel} ${d.total.toLocaleString()}${unit}`,
          )
          .join(' / ')}
      </p>
    </>
  )
}

/**
 * 추이 차트 범례 — **그림 밖**에 세울 때 쓴다 (카드 제목 줄 등). 표식은 그림이 쓰는 것과
 * 같은 어휘다: 누적은 점 달린 선, 신규는 둥근 막대. 색도 같은 토큰을 읽는다.
 *
 * 쓰는 쪽은 짝이 되는 `TrendChart` 에 `showLegend={false}` 를 함께 준다 — 안 그러면 범례가 둘이 된다.
 */
export function TrendChartLegend({
  addedLabel = '신규',
  totalLabel = '누적',
  className,
}: {
  addedLabel?: string
  totalLabel?: string
  className?: string
}) {
  return (
    <ul className={cx('ratis-chart-legend', className)}>
      <li>
        <span aria-hidden className="mark line" />
        {totalLabel}
      </li>
      <li>
        <span aria-hidden className="mark bar" />
        {addedLabel}
      </li>
    </ul>
  )
}
