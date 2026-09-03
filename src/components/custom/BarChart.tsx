import { useId } from 'react'
import {
  Bar,
  BarChart as RcBarChart,
  Cell,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BLUE_SHADES, makeShadeOf } from './blueShade'
import { cx } from './util'
import './BarChart.css'

/** 가장 긴 라벨과 막대 사이 간격. 라벨은 대상에 밀착한다 (design.md §6) */
const LABEL_GAP = 8
/**
 * 한글 한 글자가 먹는 폭 (글자크기 대비). **실측값이다** — 14px Pretendard GOV 에서
 * 「교통사고」 46 · 「쓰러짐」 35 · 「산불」 23 으로 글자당 11.5 였다 (2026-09-01 브라우저 실측).
 * 종전에는 1.0(정폭 가정)이라 라벨 칸이 10 남짓 넓게 잡혔고, 그만큼 라벨과 막대가 벌어졌다.
 */
const HANGUL_ADVANCE = 0.82
/** 라벨 칸 최소 폭 — 한두 글자만 있는 차트에서 축이 없는 것처럼 보이지 않게 */
const MIN_LABEL_WIDTH = 40
/**
 * 글자 급. 항목 이름과 눈금 숫자는 **차트 축 글자**(14)다 — 옆 추이 차트의 축과 짝이라
 * 같이 움직여야 한다. 오른쪽 건수만 **순위 막대 목록(RankBarList)과 같은 급**(15 · 강조)으로
 * 세운다 (2026-09-01 사용자 확정) — 그건 축이 아니라 값이다.
 */
const NAME_FONT_SIZE = 14
const GUIDE_FONT_SIZE = 14
const VALUE_FONT_SIZE = 15
/** 폭 어림에 쓰는 기본 급 */
const LABEL_FONT_SIZE = NAME_FONT_SIZE
/** 막대 두께 */
const BAR_SIZE = 20
/**
 * 막대 끝 라운드 — **오른쪽만** 만다. 왼쪽은 모든 막대가 같은 자리(0)에서 출발하는 눈금이라
 * 굴리면 출발선이 흐려진다. 값은 추이 차트(TrendChart)의 막대와 같은 6 이다 (2026-09-01
 * 사용자 확정) — 한 화면에 나란히 서는 두 막대가 다른 곡률이면 다른 부품으로 읽힌다.
 */
const BAR_RADIUS: [number, number, number, number] = [0, 6, 6, 0]
/** 최댓값 안내선의 숫자가 들어갈 아래 여백 (글자 13 + 선과의 간격) */
const GUIDE_LABEL_ROOM = 24

/**
 * 라벨 칸 폭을 그 차트의 **최장 라벨**로 정한다. 고정폭(종전 88)이면 이름이 짧을수록
 * 막대까지 멀어져(`침수` 60px vs `서울특별시` 18px) 라벨이 자기 막대가 아니라 패널
 * 왼쪽 모서리에 딸린 것처럼 읽혔다. 칸을 데이터에 맞추면 그 여백이 최장 라벨 기준
 * LABEL_GAP 하나로 줄어든다 (2026-08-07 화면 검토).
 *
 * SVG 에서 글자 폭을 실측하려면 그린 뒤 재야 해서 렌더가 두 번 돈다. 한글은 정폭에 가깝고
 * 라틴·숫자는 그 절반쯤이라 어림으로 충분하다.
 */
function textWidth(s: string, size = LABEL_FONT_SIZE) {
  return [...s].reduce(
    // 한글·CJK 는 HANGUL_ADVANCE, 그 밖(라틴·숫자·기호·공백)은 0.55배
    (sum, ch) => sum + size * (/[가-힣㄰-㆏一-鿿]/.test(ch) ? HANGUL_ADVANCE : 0.55),
    0,
  )
}

function axisWidth(labels: string[]) {
  /* ★ `labels.map(textWidth)` 로 넘기지 말 것 — map 이 흘리는 index 가 글자 크기 자리에 들어가
     폭이 0 으로 재진다. 실제로 라벨 칸이 최소폭(40)으로 주저앉아 「교통사고」가 막대에
     2 까지 붙었다 (2026-09-01) */
  return Math.ceil(
    Math.max(MIN_LABEL_WIDTH, ...labels.map((l) => textWidth(l, NAME_FONT_SIZE))) + LABEL_GAP,
  )
}

/**
 * 오른쪽 여백 — **막대가 쓸 수 있는 폭을 최대로 남긴다** (2026-09-01 사용자 확정).
 * 종전 32 는 아무것도 서지 않는 빈 자리였다. 맨 오른쪽 숫자는 선에 **오른끝을 맞춰** 세우므로
 * (아래 안내선 참조) 판 밖으로 나가는 부분이 없어 4 면 된다.
 * 안내선이 없으면 막대가 판 끝에 붙지 않을 만큼만 둔다.
 */
const RIGHT_ROOM = 4
const RIGHT_ROOM_PLAIN = 8
/** 건수 칸과 막대 사이 간격 */
const VALUE_GAP = 8
/** 단위(건) 글자 크기 — 수를 거들 뿐이라 한 급 작다 (design.md §2 하한 13) */
const UNIT_FONT_SIZE = 13
/** 수와 단위 사이 — 서로 붙는 한 덩어리다 (순위 막대 목록과 같은 4) */
const UNIT_GAP = 4

/**
 * 오른쪽 건수 한 줄. 축 기본 눈금은 칸 폭에 맞춰 글자를 잘라 버려(「268」이 「26」이 됐다)
 * 직접 그린다. 축선은 칸의 왼쪽 끝이므로 칸 폭만큼 밀고 오른끝을 맞춘다.
 */
function ValueTick({
  x,
  y,
  payload,
  shift,
  lookup,
  unit,
}: {
  x?: string | number
  y?: string | number
  payload?: { value?: unknown }
  /** 칸 폭 — 축선이 칸의 왼쪽 끝이라 이만큼 밀어야 오른끝이 맞는다 */
  shift: number
  /** 항목 이름 → 그 항목의 수 */
  lookup: Map<string, number>
  unit: string
}) {
  const value = lookup.get(String(payload?.value ?? '')) ?? 0
  return (
    <text className="ratis-axis-value" x={x} y={y} dx={shift} dy={5} textAnchor="end">
      {value.toLocaleString()}
      <tspan className="unit" dx={UNIT_GAP}>
        {unit}
      </tspan>
    </text>
  )
}

/**
 * 축 라벨을 직접 그린다. Recharts 기본은 축선에 맞춘 우측 정렬이라 `침수`(2자)와
 * `교통사고`(4자)의 글자 머리가 어긋나 왼쪽이 들쭉날쭉 비어 보인다.
 * tick 의 dx 로 당기는 방법은 SVG 왼쪽 밖으로 나가 첫 글자가 잘린다 — x 를 0 에 못 박는다.
 * y 는 Recharts 가 그 칸의 중심으로 넘겨주므로 dy 로 글자 높이의 절반만 내린다.
 */
function AxisLabel({ y, payload }: { y?: number; payload?: { value?: string } }) {
  return (
    <text x={0} y={y} dy={5} textAnchor="start">
      {payload?.value}
    </text>
  )
}

/**
 * 안내선을 그을 자리 — **가장 긴 막대(최댓값)를 끝으로 잡고 셋으로 나눈다.**
 * 막대에는 눈금이 없어 길이만으로는 「이게 몇이지」를 알 수 없는데, 끝과 그 사이 두 자리를
 * 적어 두면 나머지 막대가 그에 견줘 읽힌다.
 */
function guideScale(max: number) {
  if (max <= 0) return null
  /**
   * 눈금 낱칸 단위 — 자릿수에 맞춰 잡는다. 세 자리 수면 5, 네 자리면 50 …
   * 268 처럼 어중간한 수를 그대로 셋으로 나누면 89·179 가 나와 자로 읽히지 않는다.
   */
  const unit = Math.max(1, 5 * 10 ** (Math.floor(Math.log10(max)) - 2))
  /* 한 칸을 딱 떨어지는 수로 **올려** 잡는다 — 268 → 한 칸 90 → 자 끝 270 */
  const step = Math.ceil(max / 3 / unit) * unit
  /* 0 부터 적는다 — 어디서부터 재는 자인지 밝히는 자리다 (2026-09-01 사용자 확정) */
  return { top: step * 3, ticks: [0, step, step * 2, step * 3] }
}

export interface BarDatum {
  /** 항목 이름 (축 라벨) */
  label: string
  value: number
  /** 막대 색. 생략하면 코발트 */
  color?: string
}

/**
 * 가로 막대 차트 — 항목별 크기를 비교할 때. 이벤트 유형별 분포·지역 순위 등이 쓴다.
 * 그림은 Recharts 로 그린다.
 *
 * 가로형인 이유: 항목 이름이 한글이라 세로형이면 축 라벨이 기울거나 잘린다.
 * 색은 **뜻이 있을 때만** 갈린다 — 의미 없는 색 구분은 읽는 사람에게 없는 규칙을 찾게 만든다.
 * 뜻이 있는 갈래는 둘뿐이다.
 *   · 항목이 스스로 색을 갖는다 (이벤트 유형) → `color` 를 담아 보낸다
 *   · 값의 크기가 곧 위계다 (순위 분포) → `shade` 를 켠다. 많을수록 진한 파랑이 된다
 * 둘 다 아니면 코발트 한 색이다.
 *
 * 차트는 그림이라 스크린리더가 읽지 못한다. 같은 내용을 표로도 제공하거나(대체 표),
 * 최소한 caption 으로 요약을 남긴다.
 */
export function BarChart({
  data,
  caption,
  unit = '건',
  height,
  shade = false,
  track = false,
  maxGuide = false,
  showValues = false,
  className,
}: {
  data: BarDatum[]
  /** 차트가 무엇을 보여주는지 (보조기술용). 화면에는 보이지 않는다 */
  caption: string
  unit?: string
  /** 생략하면 항목 수에 맞춰 자동 (항목당 40) */
  height?: number
  /**
   * 막대 뒤에 **끝까지 가는 회색 트랙**을 깐다. 막대가 어디까지 갈 수 있는지를 함께 보여
   * 「긴 것과 짧은 것」이 아니라 「얼마나 찼는가」로 읽힌다. 0건 항목도 트랙이 남아
   * 이름만 떠 있지 않는다.
   * 트랙을 켜면 막대도 트랙과 같은 캡슐 모양이 된다 — 한쪽만 각지면 두 겹이 어긋나 보인다.
   * 순위 막대 목록(RankBarList)이 쓰는 것과 같은 트랙이다.
   */
  track?: boolean
  /**
   * 가장 큰 값 자리에 **세로 안내선**을 긋고 그 수를 선 아래에 적는다.
   * 막대에는 눈금이 없어 「이게 몇이지」를 알려면 짚어 봐야 하는데, 가장 긴 막대의 끝을
   * 한 번 적어 두면 나머지 길이가 그에 견줘 읽힌다.
   */
  maxGuide?: boolean
  /**
   * 오른쪽 끝에 **건수 한 줄**을 세운다. 막대 바로 뒤가 아니라 **판 오른쪽에 맞춰 세로로
   * 정렬**하므로 수끼리 자릿수가 맞아 위아래로 훑어 읽힌다 (순위 막대 목록과 같은 짜임).
   * 0 인 항목도 「0」이 서서 빈 줄이 아님을 말한다.
   */
  showValues?: boolean
  /**
   * 값 순위를 파랑 농도로 그린다 — 수가 많을수록 진하고 적을수록 연하다.
   * 막대 길이가 이미 크기를 말하지만, 색이 한 번 더 말해 주면 순위가 한눈에 잡힌다.
   * 척도는 분포 지도와 같은 것이다 (blueShade.ts).
   * `color` 를 스스로 가진 항목은 그 색이 이긴다 — 유형 색이 농도보다 앞선다.
   */
  shade?: boolean
  className?: string
}) {
  const descId = useId()
  const h = height ?? Math.max(160, data.length * 40 + 24)
  const shadeOf = shade ? makeShadeOf(data.map((d) => d.value)) : null
  const max = Math.max(0, ...data.map((d) => d.value))
  /* 자를 값에 딱 맞추지 않고 **딱 떨어지는 수로 올려** 잡는다 (2026-09-01 사용자 확정) —
     가장 긴 막대가 자 끝에 조금 못 미치는 대신 눈금이 90·180·270 처럼 읽힌다 */
  const scale = maxGuide ? guideScale(max) : null
  const maxLabel = scale ? scale.top.toLocaleString() : null
  /* 건수 칸 폭은 가장 긴 수가 정한다 — 그래야 수들의 오른끝이 판 오른쪽에 한 줄로 선다 */
  const valueWidth = showValues
    ? Math.ceil(
        Math.max(...data.map((d) => textWidth(d.value.toLocaleString(), VALUE_FONT_SIZE))) +
          UNIT_GAP +
          textWidth(unit, UNIT_FONT_SIZE),
      ) + VALUE_GAP
    : 0
  const valueOf = new Map(data.map((d) => [d.label, d.value]))
  /* 건수 칸이 서면 그 칸이 오른쪽 자리를 갖는다 — 여백을 따로 비우지 않는다 */
  const right = showValues ? 0 : maxLabel ? RIGHT_ROOM : RIGHT_ROOM_PLAIN

  return (
    <>
      <div className={cx('ratis-chart', className)} role="img" aria-label={caption} aria-describedby={descId}>
        <ResponsiveContainer width="100%" height={h}>
          <RcBarChart data={data} layout="vertical" margin={{
              top: 4,
              right,
              bottom: maxGuide ? GUIDE_LABEL_ROOM : 4,
              left: 0,
            }}>
            {/* 안내선을 켜면 축 상한을 최댓값에 못 박는다 — 그래야 셋이 트랙을 정확히 삼등분하고
                가장 긴 막대가 트랙 끝까지 찬다. 자동 상한은 최댓값보다 조금 위에 잡혀
                마지막 선이 끝에 못 미치고 눈금 간격도 어긋난다 */}
            <XAxis type="number" hide domain={scale ? [0, scale.top] : undefined} />
            <YAxis
              type="category"
              dataKey="label"
              width={axisWidth(data.map((d) => d.label))}
              axisLine={false}
              tickLine={false}
              tick={<AxisLabel />}
            />
            {/* 건수 한 줄 — 오른쪽 자다. 왼쪽 이름 축과 **같은 항목 축**을 쓰므로(dataKey=label)
                줄 자리가 정확히 겹치고, 보여 줄 글자만 그 항목의 수로 바꿔 끼운다.
                가운데가 기본이 아니라 축선에 붙는 왼쪽 정렬이라, 칸 폭만큼 밀어 오른끝을 맞춘다
                (추이 차트의 오른쪽 자와 같은 방식) */}
            {showValues && (
              <YAxis
                yAxisId="value"
                type="category"
                dataKey="label"
                orientation="right"
                axisLine={false}
                tickLine={false}
                /* 눈금 자리를 축선에 붙인다 — 기본값(6+2)이 붙어 있으면 아래 shift 와 겹쳐
                   글자가 판 밖으로 8 만큼 밀려 나가 마지막 자리가 잘린다 */
                tickSize={0}
                tickMargin={0}
                width={valueWidth}
                tick={<ValueTick shift={valueWidth} lookup={valueOf} unit={unit} />}
              />
            )}
            {/* 안내선은 **트랙 위 · 막대 아래**에 깔린다. 기본값대로 두면 막대보다 앞에 서서
                색 막대를 가로지르는 흰 금이 되고, 막대가 잘린 것처럼 보인다.
                (차트 라이브러리의 겹침 순서 — 트랙 −50 · 막대 300 사이인 0 을 준다) */}
            {(scale?.ticks ?? []).map((v, i, ticks) => {
              const text = v.toLocaleString()
              /* 맨 오른쪽 숫자만 선에 **오른끝**을 맞춘다. 가운데로 두면 글자 절반이 판 밖으로
                 나가고 그만큼 여백을 비워 둬야 해서 막대가 좁아진다 (2026-09-01 사용자 확정).
                 가운데 정렬이 기본이라 글자폭의 절반만큼 왼쪽으로 당겨 맞춘다 */
              const pullLeft =
                i === ticks.length - 1 ? { dx: -textWidth(text, GUIDE_FONT_SIZE) / 2 } : null
              return (
                <ReferenceLine
                  key={v}
                  x={v}
                  zIndex={0}
                  /* 격자선과 같은 옅기다 (BarChart.css `.recharts-cartesian-grid line`) —
                     옆의 추이 차트와 나란히 서므로 두 그림의 보조선이 같은 무게여야 한다 */
                  stroke="var(--ratis-gray-10)"
                  label={{ value: text, position: 'bottom', ...pullLeft }}
                />
              )
            })}
            <Tooltip
              cursor={{ fill: 'var(--ratis-gray-5)' }}
              formatter={(v) => [`${Number(v).toLocaleString()}${unit}`, '']}
              contentStyle={{
                borderRadius: '0.8rem',
                border: '1px solid var(--ratis-gray-20)',
                fontSize: '1.4rem',
              }}
            />
            <Bar
              dataKey="value"
              radius={BAR_RADIUS}
              barSize={BAR_SIZE}
              /* 트랙도 막대와 같은 모양이다 — 오른쪽만 반원, 왼쪽은 각지게.
                 ★ 트랙을 요소로 넘긴다 (값 묶음이 아니라) — 차트 라이브러리의 트랙 타입이
                 네 귀를 따로 받지 못해 수 하나만 허용한다 */
              background={
                track ? (
                  <Rectangle fill="var(--ratis-gray-5)" radius={BAR_RADIUS} />
                ) : undefined
              }
              /* 0건 줄의 트랙을 살리는 자리다. 차트 라이브러리는 길이 0 인 막대를 그리기 전에
                 통째로 걷어내는데, 그때 그 줄의 트랙까지 함께 사라진다 — 이름만 덩그러니 남아
                 「유형이 없는 것」처럼 읽힌다. 막대 모양을 우리가 넘기면 그 걷어내기를 건너뛰고,
                 길이 0 인 막대는 모양 쪽에서 알아서 안 그린다. 결과: 트랙만 남는다 */
              shape={track ? <Rectangle /> : undefined}
            >
              {data.map((d) => (
                <Cell
                  key={d.label}
                  fill={
                    d.color ??
                    (shadeOf
                      ? BLUE_SHADES[shadeOf(d.value)]
                      : 'var(--ratis-blue-50)')
                  }
                />
              ))}
            </Bar>
          </RcBarChart>
        </ResponsiveContainer>
      </div>
      {/* ★ 그림이 말하는 값을 글로도 둔다. `role="img"` 가 안을 통째로 감춰 이름(caption)만으로는
          값이 하나도 전해지지 않는다 — 이름과 갈라 설명(describedby)으로 두는 까닭은 design.md §15.
          항목마다 「이름 값」 한 짝 */}
      <p id={descId} className="visually-hidden">
        {data.map((d) => `${d.label} ${d.value.toLocaleString()}${unit}`).join(', ')}
      </p>
    </>
  )
}
