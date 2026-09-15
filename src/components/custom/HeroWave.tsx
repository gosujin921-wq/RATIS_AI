import { useEffect, useId, useState } from 'react'
import { motion, useReducedMotion, type Transition } from 'motion/react'
import './HeroWave.css'

/**
 * 시작 화면 심볼 — **방사선 파동 + 각 분야 도달** (2026-09-14 협회 「디자인 시안 의견」).
 *
 * 중심의 정보가 파동처럼 퍼져 관련 분야 각 지점에 닿는다는 두 뜻을 한 그림에 담는다.
 *
 * ★ **모양은 협회 참고 그림 실측 그대로다** (의견서 2쪽 그림, 1200px → 240 뷰박스 ÷ 5).
 *   코어 r 91 → 18 · 링 둘 r 232·366 → 46·73, 굵기 33 → 6.5 · 점 r 53 → 10.5, 거리 467 → 94.
 *   처음엔 코어를 옅은 원반에 앉히고 살·점선 궤도를 더했다가 걷어냈다 — 눈알과 바퀴로 읽혔다
 *   (2026-09-14 사용자 지적). 참고 그림에 없는 조각은 두지 않는다.
 *   색만 협회 표를 따른다: 코어 딥 네이비(blue-70) · 링 블루 · 도달점 틸(accent).
 *
 * 움직임은 `motion/react` 가 진다 (형제 프로젝트와 같은 12.40.0). 가져온 것:
 *   · 오버슈트 곡선 `[0.34, 1.35, 0.64, 1]` — KLID 2차 RegionBubbleMap 버블 등장. 링·점이 켜질 때 튄다
 *   · 두 겹 시차 잔물결(안 겹 0.8) — DS MapMarker · NDMS PulseDot. 점이 켜질 때 퍼진다
 *   · 스태거 등장 — KLID 2차 HeroSectionV2. 첫 진입 때 코어 → 링 → 점 순서로 선다
 *
 * 루프(3.6초): 코어가 한 번 펌프하고 가는 파동이 바깥으로 나간다. 파동이 지나는 순간 **안쪽 링 →
 * 바깥 링 → 다섯 점**이 차례로 켜진다(굵어졌다 되돌아오며 밝아짐). 점은 시계 방향으로 조금씩 늦게
 * 켜지며 틸 잔물결을 내고, 다음 파동까지 서서히 가라앉는다. 모양 자체는 한순간도 참고 그림을 벗어나지 않는다.
 *
 * ★ 링·점·파동이 **같은 3.6초 시계**를 본다. 켜지는 순간(HIT_*)은 파동 반지름에서 계산된다 — 파동의
 *   끝 반지름을 바꾸면 전부 따라 바뀐다.
 * ★ transform 을 쓰지 않는다. SVG 에서 scale 은 원점이 꼬이기 쉬워 r · strokeWidth · opacity 만 움직인다.
 * ★ 속성별 transition 에도 루프 기본값을 다시 깐다 — motion 은 `opacity: {…}` 를 주면 상위 duration·repeat 를
 *   물려주지 않는다 (실측: 링이 첫 바퀴에 사라졌다).
 * ★ 장식이다. `aria-hidden`. 움직임 줄이기에서는 완성된 그림 한 장.
 */

const CYCLE = 3.6
const ENTER_TOTAL = 1.1

const C = 120
const CORE_R = 18
const RING_IN_R = 46
const RING_OUT_R = 73
const RING_W = 6.5
const POINT_DIST = 94
const POINT_R = 10.5
/** 파동이 사라지는 반지름 — 점을 조금 지나쳐 「지나간다」로 읽힌다 */
const WAVE_END_R = 108

/** 파동이 그 반지름에 닿는 진행도 (등속) */
const hit = (r: number) => (r - CORE_R) / (WAVE_END_R - CORE_R)
const HIT_IN = hit(RING_IN_R)
const HIT_OUT = hit(RING_OUT_R)
const HIT_POINT = hit(POINT_DIST)
const POINT_STAGGER = 0.08

const OVERSHOOT: [number, number, number, number] = [0.34, 1.35, 0.64, 1]
const SETTLE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

/** 분야점 — 정오각형. 위(-90°)에서 시계 방향 */
const POINTS = Array.from({ length: 5 }, (_, i) => {
  const a = (-90 + i * 72) * (Math.PI / 180)
  return { key: i, cx: r1(C + POINT_DIST * Math.cos(a)), cy: r1(C + POINT_DIST * Math.sin(a)) }
})

function r1(n: number) {
  return Math.round(n * 10) / 10
}

/** 링이 켜지는 키프레임 — 파동이 닿기 직전 옅던 것이 튀어 밝아지고 다음 파동까지 가라앉는다 */
function ringKeys(at: number) {
  const on = Math.min(at + 0.05, 0.99)
  return {
    opacity: [0.55, 0.55, 1, 1, 0.55],
    strokeWidth: [RING_W, RING_W, RING_W * 1.3, RING_W, RING_W],
    times: [0, at, on, Math.min(on + 0.12, 0.995), 1],
    ease: ['linear', 'linear', OVERSHOOT, 'linear', 'easeInOut'] as Transition['ease'],
  }
}

export function HeroWave({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const gradientId = useId()
  const [looping, setLooping] = useState(false)

  useEffect(() => {
    if (reduce) return
    const t = setTimeout(() => setLooping(true), ENTER_TOTAL * 1000)
    return () => clearTimeout(t)
  }, [reduce])

  const loop = (extra: Transition = {}): Transition => ({
    duration: CYCLE,
    repeat: Infinity,
    ease: 'linear',
    ...extra,
  })

  const cls = className ? `hero-wave ${className}` : 'hero-wave'

  if (reduce) {
    return (
      <svg className={cls} viewBox="0 0 240 240" aria-hidden focusable="false">
        <circle className="hero-wave-ring-out" cx={C} cy={C} r={RING_OUT_R} strokeWidth={RING_W} />
        <circle className="hero-wave-ring-in" cx={C} cy={C} r={RING_IN_R} strokeWidth={RING_W} />
        <circle className="hero-wave-core" cx={C} cy={C} r={CORE_R} />
        {POINTS.map((p) => (
          <circle key={p.key} className="hero-wave-point" cx={p.cx} cy={p.cy} r={POINT_R} />
        ))}
      </svg>
    )
  }

  const inKeys = ringKeys(HIT_IN)
  const outKeys = ringKeys(HIT_OUT)

  return (
    <svg className={cls} viewBox="0 0 240 240" aria-hidden focusable="false">
      <defs>
        {/* 파동의 선 — 코어의 블루에서 도달점의 틸로 */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="hero-wave-grad-from" />
          <stop offset="1" className="hero-wave-grad-to" />
        </linearGradient>
      </defs>

      {/* 링 둘 — 등장 때 넘쳤다 자리 잡고, 루프에서는 파동이 지나는 순간 켜진다 */}
      <motion.circle
        className="hero-wave-ring-out"
        cx={C}
        cy={C}
        initial={{ r: 0, opacity: 0, strokeWidth: RING_W }}
        animate={
          looping
            ? { r: RING_OUT_R, opacity: outKeys.opacity, strokeWidth: outKeys.strokeWidth }
            : { r: RING_OUT_R, opacity: 0.55, strokeWidth: RING_W }
        }
        transition={
          looping
            ? loop({ times: outKeys.times, ease: outKeys.ease })
            : { duration: 0.6, delay: 0.3, ease: OVERSHOOT }
        }
      />
      <motion.circle
        className="hero-wave-ring-in"
        cx={C}
        cy={C}
        initial={{ r: 0, opacity: 0, strokeWidth: RING_W }}
        animate={
          looping
            ? { r: RING_IN_R, opacity: inKeys.opacity, strokeWidth: inKeys.strokeWidth }
            : { r: RING_IN_R, opacity: 0.55, strokeWidth: RING_W }
        }
        transition={
          looping
            ? loop({ times: inKeys.times, ease: inKeys.ease })
            : { duration: 0.55, delay: 0.15, ease: OVERSHOOT }
        }
      />

      {/* 파동 — 가는 그라데이션 선 하나. 코어에서 나와 점을 지나며 사라진다 */}
      <motion.circle
        className="hero-wave-wave"
        cx={C}
        cy={C}
        stroke={`url(#${gradientId})`}
        initial={{ r: CORE_R, opacity: 0 }}
        animate={looping ? { r: [CORE_R, WAVE_END_R], opacity: [0.9, 0.6, 0] } : { r: CORE_R, opacity: 0 }}
        transition={looping ? loop({ opacity: loop({ times: [0, 0.7, 1] }) }) : { duration: 0 }}
      />

      {/* 코어 — 등장 때 튀어 오르고, 루프 첫 순간에 한 번 펌프한다 */}
      <motion.circle
        className="hero-wave-core"
        cx={C}
        cy={C}
        initial={{ r: 0 }}
        animate={looping ? { r: [CORE_R, CORE_R - 1.4, CORE_R + 1.6, CORE_R] } : { r: CORE_R }}
        transition={
          looping
            ? loop({ times: [0, 0.05, 0.16, 0.45], ease: ['easeIn', 'easeOut', 'easeInOut'] })
            : { duration: 0.5, ease: OVERSHOOT }
        }
      />

      {/* 분야점 — 시계 방향 스태거 등장. 루프에서는 파동이 닿는 순간 튀어 켜지며 잔물결 둘을 낸다 */}
      {POINTS.map((p, i) => {
        const delay = i * POINT_STAGGER
        return (
          <g key={p.key}>
            <motion.circle
              className="hero-wave-ripple"
              cx={p.cx}
              cy={p.cy}
              initial={{ r: POINT_R, opacity: 0 }}
              animate={
                looping
                  ? { r: [POINT_R, POINT_R, POINT_R, 34], opacity: [0, 0, 0.5, 0] }
                  : { r: POINT_R, opacity: 0 }
              }
              transition={looping ? loop({ delay, times: [0, HIT_POINT, HIT_POINT, 1], ease: 'easeOut' }) : { duration: 0 }}
            />
            <motion.circle
              className="hero-wave-ripple"
              cx={p.cx}
              cy={p.cy}
              initial={{ r: POINT_R, opacity: 0 }}
              animate={
                looping
                  ? { r: [POINT_R, POINT_R, POINT_R, 27], opacity: [0, 0, 0.65, 0] }
                  : { r: POINT_R, opacity: 0 }
              }
              transition={
                looping ? loop({ delay: delay + 0.12, times: [0, HIT_POINT, HIT_POINT, 1], ease: 'easeOut' }) : { duration: 0 }
              }
            />
            <motion.circle
              className="hero-wave-point"
              cx={p.cx}
              cy={p.cy}
              initial={{ r: 0, opacity: 0 }}
              animate={
                looping
                  ? {
                      r: [POINT_R + 0.5, POINT_R, POINT_R, POINT_R + 2.8, POINT_R + 0.5],
                      opacity: [1, 0.5, 0.5, 1, 1],
                    }
                  : { r: POINT_R, opacity: 0.5 }
              }
              transition={
                looping
                  ? loop({
                      delay,
                      times: [0, 0.3, HIT_POINT, HIT_POINT + 0.06, 1],
                      ease: ['easeOut', 'linear', 'linear', OVERSHOOT],
                    })
                  : { duration: 0.5, delay: 0.5 + i * 0.08, ease: SETTLE }
              }
            />
          </g>
        )
      })}
    </svg>
  )
}
