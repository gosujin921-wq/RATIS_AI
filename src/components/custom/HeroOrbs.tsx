import { motion, useReducedMotion, type Transition } from 'motion/react'
import './HeroOrbs.css'

/**
 * 시작 화면 심볼 둘째 타입 — **유리 구슬이 터져 퍼졌다가 링으로 모인다** (2026-09-14, docs/mov2.mov 실측).
 *
 * 첫 타입(HeroWave · 파동 + 각 분야 도달)과 다른 서사다. 가운데 흰 유리구슬 하나가 서 있고,
 * 색 구슬 일곱이 양옆으로 터져 나가 흩어진다. 그중 하나는 화면 오른쪽 아래로 크게 다가와
 * 구석을 덮고, 나머지는 자리에서 느리게 떠돈다. 그러다 구슬들이 알약 조각으로 늘어나며
 * 가운데 구슬 둘레의 링으로 모여 닫히고, 링이 중심으로 빨려 들어가 다시 터진다.
 *
 * ★ **영상 한 바퀴 1.65초를 구간 비율 그대로 옮겼다** (20fps 33장 대조).
 *   터짐 0~6% · 흩어짐 ~24% · 떠돎 ~64% · 링 모임 ~84% · 링 유지 ~94% · 중심 수축 ~100%.
 *   박자만 두 배로 늘렸다 — 협회가 첫 타입에 요청한 3~4초 안에 들어오게. 영상 속도 그대로 보려면
 *   CYCLE 을 1.65 로 바꾸면 된다. 구간 비율은 그대로 따라온다.
 * ★ 무대(어두운 남색 면)가 컴포넌트 안에 있다. 유리 구슬의 빛은 어두운 바닥이 있어야 서고,
 *   시작 화면 바닥(gray-5)에 그대로 얹으면 색 구슬만 둥둥 뜬다. 무대 색은 blue-90·95 토큰.
 * ★ 구슬의 무지개색(보라 · 자홍 · 금)은 팔레트 밖이다. ratis-effects.css 의 히어로 한정 연출색과
 *   같은 취급으로 HeroOrbs.css 의 `.hero-orbs` 스코프 변수로만 둔다 — 화면 어디에도 새지 않는다.
 * ★ HTML div 라 transform 을 쓴다 (HeroWave 의 「transform 금지」는 SVG 원점 문제라 여기엔 없다).
 *   자리(left·top)와 길이(width)는 장면 % 로 움직여 부모 크기에 무관하다. 알약은 scaleX 가 아니라
 *   **width** 다 — 늘려도 양 끝이 둥근 캡슐로 남고, 회전과 축이 꼬이지 않는다. 터질 때는 회전이 0 이라
 *   같은 width 늘림이 그대로 영상의 가로 잔상이 된다.
 * ★ 흐림(blur)은 transform 앞에서 걸리므로 커진 구슬에서는 배율만큼 번진다. 다가오는 구슬의 흐림값이
 *   작은 이유다 (0.6 × 7배).
 * ★ 장식이다. `aria-hidden`. 움직임 줄이기에서는 링이 닫힌 그림 한 장.
 */

const CYCLE = 3.3

/** 구간 경계 — 영상 33장 중 몇 번째 프레임인지 그대로 비율로 */
const T_BURST = 0.06
const T_SPREAD = 0.24
const T_DRIFT = 0.64
/** 모이는 길 중간 — 커졌던 구슬이 제 크기로 돌아온 뒤에 알약으로 늘어난다 (영상 프레임 24~26) */
const T_GATHER = 0.74
const T_RING = 0.84
const T_HOLD = 0.94

/** 장면 % — 가운데 구슬 지름 · 링 반지름(중심선) · 색 구슬 기본 지름 (영상 308px 세로 기준 실측) */
const CORE_SIZE = 17
const RING_R = 37
const SAT_SIZE = 9
/** 링에서 알약이 되는 길이 배율 · 터질 때 가로 잔상 배율 */
const PILL_X = 3.4
const SMEAR_X = 1.8
/** 링이 닫힌 뒤 살짝 도는 각도 */
const HOLD_TURN = 12

const OVERSHOOT: [number, number, number, number] = [0.34, 1.35, 0.64, 1]
const SNAP: [number, number, number, number] = [0.16, 1, 0.3, 1]
const SETTLE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

type Tone = 'blue' | 'gold' | 'violet' | 'aqua'

type Sat = {
  key: string
  tone: Tone
  /** 터져 나간 자리 (장면 %) · 그때 크기 배율 */
  home: [number, number]
  homeScale: number
  /** 떠돌다 닿는 자리 · 크기 배율 */
  drift: [number, number]
  driftScale: number
  /** 다가오는 큰 구슬 — 장면 밖까지 커진다 */
  near?: boolean
}

/** 일곱 구슬 — 자리·크기는 영상 프레임 8 · 22 실측. 링 위 각도는 배열 순서로 위(-90°)부터 시계 방향 등분.
    다가오는 금색 구슬은 오른쪽 아래 */
const SATS: Sat[] = [
  { key: 'l', tone: 'aqua', home: [-4, 44], homeScale: 1.7, drift: [-10, 48], driftScale: 1.9 },
  { key: 'tl', tone: 'blue', home: [13, 22], homeScale: 1.4, drift: [11, 19], driftScale: 1.5 },
  { key: 'tr', tone: 'violet', home: [58, 22], homeScale: 0.85, drift: [62, 19], driftScale: 0.8 },
  { key: 'r', tone: 'gold', home: [92, 36], homeScale: 1.2, drift: [97, 32], driftScale: 1.1 },
  { key: 'near', tone: 'gold', home: [78, 84], homeScale: 7, drift: [86, 96], driftScale: 8.5, near: true },
  { key: 'b', tone: 'violet', home: [40, 96], homeScale: 1.1, drift: [36, 102], driftScale: 1.2 },
  { key: 'bl', tone: 'blue', home: [6, 72], homeScale: 2.6, drift: [-2, 80], driftScale: 3.2 },
]
const STEP = 360 / SATS.length

const pct = (n: number) => `${Math.round(n * 10) / 10}%`

/** 링 위 자리 — 가운데를 (50, 50) 으로 두고 각도만큼 */
function onRing(angle: number): [number, number] {
  const a = (angle * Math.PI) / 180
  return [50 + RING_R * Math.cos(a), 50 + RING_R * Math.sin(a)]
}

export function HeroOrbs({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const cls = className ? `hero-orbs ${className}` : 'hero-orbs'

  if (reduce) {
    return (
      <div className={cls} aria-hidden>
        <div className="hero-orbs-glow" />
        <div className="hero-orbs-scene">
          {SATS.map((s, i) => {
            const angle = -90 + i * STEP
            const [x, y] = onRing(angle)
            return (
              <div
                key={s.key}
                className="hero-orbs-sat"
                style={{
                  left: pct(x),
                  top: pct(y),
                  width: pct(SAT_SIZE * PILL_X),
                  height: pct(SAT_SIZE),
                  transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                }}
              >
                <div className={`hero-orbs-ball hero-orbs-ball-${s.tone}`} />
              </div>
            )
          })}
          <div
            className="hero-orbs-core"
            style={{ width: pct(CORE_SIZE), height: pct(CORE_SIZE), transform: 'translate(-50%, -50%)' }}
          >
            <div className="hero-orbs-ball hero-orbs-ball-glass" />
          </div>
        </div>
      </div>
    )
  }

  const loop = (extra: Transition = {}): Transition => ({
    duration: CYCLE,
    repeat: Infinity,
    ease: 'linear',
    ...extra,
  })

  /** 키프레임 자리 — 중심 → 터지는 중 → 터진 자리 → 떠돈 자리 → 모이는 길 → 링 → 링(살짝 돎) → 중심 */
  const TIMES = [0, T_BURST, T_SPREAD, T_DRIFT, T_GATHER, T_RING, T_HOLD, 1]
  const EASES: Transition['ease'] = [SNAP, 'easeOut', 'easeInOut', 'easeIn', OVERSHOOT, 'linear', 'easeIn']

  return (
    <div className={cls} aria-hidden>
      {/* 바닥의 큰 빛 — 영상의 아래쪽 밝은 파랑. 터질 때 한 번 부푼다 */}
      <motion.div
        className="hero-orbs-glow"
        animate={{ scale: [1, 1.12, 1, 1, 1], opacity: [0.9, 1, 0.85, 0.85, 0.9] }}
        transition={loop({ times: [0, T_BURST, T_SPREAD, T_RING, 1], ease: 'easeInOut' })}
      />

      <div className="hero-orbs-scene">
        {SATS.map((s, i) => {
          const angle = -90 + i * STEP
          const [rx, ry] = onRing(angle)
          const [hx, hy] = onRing(angle + HOLD_TURN)
          // 터질 때 지나는 자리 — 양옆으로 먼저 튀고(영상의 가로 잔상) 제자리로 간다
          const burstX = 50 + (s.home[0] - 50) * 0.55
          const burstY = 50 + (s.home[1] - 50) * 0.25
          // 모이는 길 중간 — 떠돈 자리와 링 자리의 가운데
          const gx = (s.drift[0] + rx) / 2
          const gy = (s.drift[1] + ry) / 2
          const w = SAT_SIZE
          const tangent = angle + 90
          return (
            <motion.div
              key={s.key}
              className={`hero-orbs-sat${s.near ? ' hero-orbs-sat-near' : ''}`}
              style={{ height: pct(SAT_SIZE), x: '-50%', y: '-50%' }}
              animate={{
                left: [pct(50), pct(burstX), pct(s.home[0]), pct(s.drift[0]), pct(gx), pct(rx), pct(hx), pct(50)],
                top: [pct(50), pct(burstY), pct(s.home[1]), pct(s.drift[1]), pct(gy), pct(ry), pct(hy), pct(50)],
                width: [pct(w), pct(w * SMEAR_X), pct(w), pct(w), pct(w), pct(w * PILL_X), pct(w * PILL_X), pct(w)],
                rotate: [0, 0, 0, 0, tangent, tangent, tangent + HOLD_TURN, tangent + HOLD_TURN],
                scale: [0.3, 1, s.homeScale, s.driftScale, 1, 1, 1, 0.3],
              }}
              transition={loop({ times: TIMES, ease: EASES })}
            >
              <motion.div
                className={`hero-orbs-ball hero-orbs-ball-${s.tone}`}
                animate={{
                  opacity: [0, 0.9, 1, 1, 1, 1, 1, 0],
                  filter: [
                    'blur(0px)',
                    'blur(5px)',
                    s.near ? 'blur(0.6px)' : 'blur(0.4px)',
                    s.near ? 'blur(0.8px)' : 'blur(0.4px)',
                    'blur(0.4px)',
                    'blur(0px)',
                    'blur(0px)',
                    'blur(2px)',
                  ],
                }}
                transition={loop({ times: TIMES, ease: EASES })}
              />
            </motion.div>
          )
        })}

        {/* 가운데 유리구슬 — 터지는 순간 한 번 부풀고 빛난다. 링이 모일 때는 그대로 */}
        <motion.div
          className="hero-orbs-core"
          style={{ width: pct(CORE_SIZE), height: pct(CORE_SIZE), x: '-50%', y: '-50%' }}
          animate={{ scale: [1, 1.18, 1, 1, 1, 0.94, 1] }}
          transition={loop({
            times: [0, 0.03, T_BURST + 0.06, T_DRIFT, T_RING, 0.985, 1],
            ease: ['easeOut', SETTLE, 'linear', 'linear', 'easeIn', 'easeOut'],
          })}
        >
          <motion.div
            className="hero-orbs-ball hero-orbs-ball-glass"
            animate={{ filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)', 'brightness(1)', 'brightness(1.25)'] }}
            transition={loop({ times: [0, 0.03, T_SPREAD, T_HOLD, 1], ease: 'easeInOut' })}
          />
        </motion.div>
      </div>
    </div>
  )
}
