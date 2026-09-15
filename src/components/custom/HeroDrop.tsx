import { useEffect } from 'react'
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
} from 'motion/react'
import './HeroDrop.css'

/**
 * 시작 화면 심볼 셋째 타입 — **씨앗이 링이 되고, 방울이 떠올라 중심이 되고, 링이 돌다 흩어진다**
 * (2026-09-14, docs/mov.mov 60fps 실측).
 *
 * 서사는 한 줄이다. 작은 점 하나가 아래로 가라앉아 링으로 펴지고, 링 바닥에 고인 빛이 방울로 떨어져
 * 나와 중심까지 떠올라 코어가 된다. 링은 대각 축으로 빠르게 돌다 걷히고, 코어는 다시 씨앗으로 잦아든다.
 * 「모여서 답이 되고 다시 열린다」로 읽힌다 — 첫 타입(HeroWave · 퍼짐과 도달)과 다른 뜻이라 나란히 둔다.
 *
 * ★ **영상 한 바퀴 3.6초를 그대로 쓴다.** 협회가 첫 타입에 요청한 3~4초 안이고 첫 타입과 같은 박자다.
 *   구간 경계(T_*)는 60fps 프레임 번호를 비율로 옮긴 값이다.
 * ★ **회전은 진짜 회전이다.** 영상의 타원·선은 링이 변형되는 게 아니라 원이 대각 축(왼쪽 아래 → 오른쪽 위)
 *   으로 90°에 0.28초씩 도는 걸 정면에서 본 것이다 (프레임마다 가장자리에 잔상이 붙는다). 그래서 링은
 *   SVG 안에서 rx·ry 로 흉내 내지 않고 **HTML 층(div)에 rotate3d 를 건다.** SVG 요소의 3D transform 은
 *   브라우저마다 평면으로 눕혀 버리므로 층을 나눈 것이다. 잔상은 같은 링을 조금 늦게 따라 돌리는
 *   유령 층 하나가 낸다 (blur 필터는 매 프레임 비용이라 안 쓴다).
 * ★ **방울은 블러가 아니라 형태다.** 60fps 로 40장 넘게 같은 물방울 모양이 한 프레임에 1px 씩 올라간다.
 *   머리(원)와 꼬리(path) 두 조각을 같은 키프레임 시각·같은 곡선으로 움직여 붙여 둔다 — 꼬리 `d` 는
 *   명령 구조가 같아 motion 이 숫자만 보간한다.
 * ★ **밝은 면 위에 바로 선다.** 무대(어두운 박스)를 제 안에 갖지 않는다 (2026-09-14 결정). 영상의 흰빛
 *   발광은 밝은 바닥에서 뒤집힌다 — 링은 blue-50 선 + blue-10 넓은 후광, 코어·방울은 blue-70,
 *   안쪽 가는 링만 accent(틸). 색은 전부 토큰(HeroDrop.css).
 * ★ 장식이다. `aria-hidden`. 움직임 줄이기에서는 링이 닫히고 코어가 가운데 선 그림 한 장.
 */

/** 한 바퀴. 영상 실측 3.6초 = 첫 타입과 같은 박자 */
const CYCLE = 3.6

/* 구간 경계 — 한 바퀴 안의 비율 (영상 60fps 프레임 번호 ÷ 216) */
/** 씨앗이 링 바닥 자리까지 가라앉는다 */
const T_SINK = 0.07
/** 링이 바닥에서 양쪽으로 그려져 위에서 닫힌다 */
const T_DRAWN = 0.17
/** 링 바닥에 빛이 고여 방울 머리가 된다 */
const T_DROP = 0.23
/** 떠오르는 길 중간 — 꼬리가 아직 링 바닥에 붙어 있다 */
const T_MID = 0.31
/** 머리가 중심에 닿는다 */
const T_RISEN = 0.4
/** 꼬리가 걷히고 둥근 코어가 된다 */
const T_CORE = 0.46
/** 링이 돌기 시작한다 */
const T_SPIN = 0.48
/** 도는 링이 되감기며 걷히기 시작한다 */
const T_UNDRAW = 0.62
/** 링이 다 걷혔다 */
const T_GONE = 0.8
/** 코어가 씨앗으로 잦아들어 제자리(중심 조금 아래)에 선다 */
const T_SEED = 0.9

/* 기하 — 뷰박스 240, 중심 (120, 120) */
const C = 120
const RING_R = 84
const RING_W = 4
/** 링 바닥 y · 방울 머리가 고이는 y (링 안쪽 면에 붙는다) */
const RING_BOTTOM = C + RING_R
const DROP_HEAD_R = 7
const DROP_REST_Y = RING_BOTTOM - RING_W / 2 - DROP_HEAD_R
/** 떠오르는 길 중간의 머리 y — 꼬리 끝이 아직 링 바닥에 닿는 자리 */
const DROP_MID_Y = 172
const CORE_R = 8
const SEED_R = 3
/** 씨앗이 쉬는 자리 — 중심보다 조금 아래 (영상에서 점이 링 중심 아래에 선다) */
const SEED_Y = C + 12
/** 후광은 코어의 몇 배인가 */
const HALO_X = 2.4
/** 안쪽 가는 링 — 회전 끝자락에 잠깐 떴다 사라진다 */
const INNER_FROM = 10
const INNER_TO = 20

/** 링이 도는 각도. 90° 에 0.28초 = 영상 실측 속도에 맞춘 값 */
const SPIN_DEG = 240
/** 유령 링이 따라오는 각도 차 — 잔상의 길이 */
const GHOST_LAG = 14

/** 형제들이 쓰는 곡선 (HeroWave 와 같다) */
const OVERSHOOT: [number, number, number, number] = [0.34, 1.35, 0.64, 1]
const SETTLE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

/** 반원 둘 — 둘 다 바닥(6시)에서 출발해 위(12시)에서 만난다. pathLength 를 함께 키우면 바닥에서 양쪽으로 그려진다 */
const ARC_LEFT = `M ${C} ${RING_BOTTOM} A ${RING_R} ${RING_R} 0 0 1 ${C} ${C - RING_R}`
const ARC_RIGHT = `M ${C} ${RING_BOTTOM} A ${RING_R} ${RING_R} 0 0 0 ${C} ${C - RING_R}`

/** 물방울 꼬리 — 머리 양옆에서 나와 아래 한 점으로 모인다. 키프레임마다 명령 구조가 같아야 보간된다 */
const tail = (y: number, len: number) =>
  `M ${C - DROP_HEAD_R} ${y} Q ${C} ${y + len * 0.55} ${C} ${y + len} Q ${C} ${y + len * 0.55} ${C + DROP_HEAD_R} ${y} Z`

export function HeroDrop({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const cls = className ? `hero-drop ${className}` : 'hero-drop'

  /* 링의 회전각 — 한 값을 본 링과 유령 링이 나눠 본다. 대각 축(1, -1, 0) = 왼쪽 아래 → 오른쪽 위 */
  const angle = useMotionValue(0)
  const ghostAngle = useTransform(angle, (a) => Math.max(0, a - GHOST_LAG))
  const ringTransform = useMotionTemplate`rotate3d(1, -1, 0, ${angle}deg)`
  const ghostTransform = useMotionTemplate`rotate3d(1, -1, 0, ${ghostAngle}deg)`

  useEffect(() => {
    if (reduce) return
    const control = animate(angle, [0, 0, SPIN_DEG, SPIN_DEG], {
      duration: CYCLE,
      repeat: Infinity,
      times: [0, T_SPIN, T_GONE, 1],
      // 돌기 시작하자마자 빠르다 — 영상은 첫 0.28초에 옆면(90°)까지 가고 그 뒤 잦아들며 걷힌다
      ease: ['linear', 'easeOut', 'linear'],
    })
    return () => control.stop()
  }, [angle, reduce])

  /* 움직임 줄이기 — 링이 닫히고 코어가 가운데 선 그림 한 장 */
  if (reduce) {
    return (
      <div className={cls} aria-hidden>
        <div className="hero-drop-layer">
          <svg className="hero-drop-svg" viewBox="0 0 240 240" focusable="false">
            <path className="hero-drop-ring-glow" d={ARC_LEFT} />
            <path className="hero-drop-ring-glow" d={ARC_RIGHT} />
            <path className="hero-drop-ring" d={ARC_LEFT} />
            <path className="hero-drop-ring" d={ARC_RIGHT} />
          </svg>
        </div>
        <div className="hero-drop-layer">
          <svg className="hero-drop-svg" viewBox="0 0 240 240" focusable="false">
            <circle className="hero-drop-halo" cx={C} cy={C} r={CORE_R * HALO_X} />
            <circle className="hero-drop-core" cx={C} cy={C} r={CORE_R} />
          </svg>
        </div>
      </div>
    )
  }

  /* 루프 공통 — 3.6초 무한. 조각마다 times 로 제 순간을 잡는다.
     ★ 속성별 옵션은 상위 duration·repeat 를 물려받지 않는다 (HeroWave 실측). 여기서는 속성별 옵션을
       안 쓰고 조각마다 한 transition 으로 모든 속성을 같은 times 에 태운다 */
  const loop = (extra: Transition = {}): Transition => ({
    duration: CYCLE,
    repeat: Infinity,
    ease: 'linear',
    ...extra,
  })

  /* 링 — 씨앗이 닿은 뒤 바닥에서 그려지고, 돌다가 되감기며 걷힌다 */
  const ringTimes = [0, T_SINK, T_DRAWN, T_UNDRAW, T_GONE, 1]
  const ringLength = [0, 0, 1, 1, 0, 0]
  const ringOpacity = [0, 0, 1, 1, 0.5, 0]
  const ringEase: Transition['ease'] = ['linear', SETTLE, 'linear', 'easeIn', 'linear']

  /* 유령 링 — 도는 동안만 본 링 뒤를 따라온다 */
  const ghostTimes = [0, T_SPIN, T_SPIN + 0.04, T_UNDRAW, T_GONE, 1]
  const ghostOpacity = [0, 0, 1, 1, 0, 0]

  /* 코어 한 조각이 씨앗 → 방울 머리 → 코어 → 씨앗을 다 산다.
     T_SINK 에서 링 바닥에 닿아 링으로 흡수되고(r 0), T_DRAWN 뒤 바닥에서 방울로 다시 고인다 */
  const coreTimes = [0, T_SINK, T_SINK + 0.03, T_DRAWN, T_DROP, T_MID, T_RISEN, T_CORE, T_GONE, T_SEED, 1]
  const coreY = [SEED_Y, RING_BOTTOM, RING_BOTTOM, DROP_REST_Y, DROP_REST_Y, DROP_MID_Y, C, C, C, SEED_Y, SEED_Y]
  const coreR = [SEED_R, SEED_R, 0, 0, DROP_HEAD_R, DROP_HEAD_R, DROP_HEAD_R + 0.5, CORE_R, CORE_R, SEED_R, SEED_R]
  const coreEase: Transition['ease'] = [
    'easeIn', // 씨앗 가라앉음
    'easeIn', // 링에 흡수
    'linear',
    OVERSHOOT, // 방울 고임
    'easeIn', // 떠오름 앞 절반 — 꼬리와 같은 곡선
    'easeOut', // 떠오름 뒤 절반 — 꼬리와 같은 곡선
    SETTLE, // 둥글어짐
    'linear',
    'easeInOut', // 씨앗으로 잦아듦
    'linear',
  ]

  /* 꼬리 — 머리와 같은 시각·같은 곡선으로 움직여야 붙어 있다 */
  const tailTimes = [0, T_DROP, T_MID, T_RISEN, T_CORE, 1]
  const tailD = [
    tail(DROP_REST_Y, 0),
    tail(DROP_REST_Y, 0),
    tail(DROP_MID_Y, RING_BOTTOM - RING_W / 2 - DROP_MID_Y),
    tail(C, 12),
    tail(C, 0),
    tail(C, 0),
  ]
  const tailEase: Transition['ease'] = ['linear', 'easeIn', 'easeOut', SETTLE, 'linear']

  /* 안쪽 가는 링 — 회전 끝자락에 코어 둘레로 잠깐 퍼졌다 사라진다.
     ★ opacity 가 아니라 strokeOpacity 다. opacity 는 motion 이 브라우저 가속(WAAPI)으로 넘기는데, 단일 ease +
       times 조합에서 r 과 시각이 어긋났다 (2026-09-14 실측 — 불투명도가 한 구간 앞서 떴다). strokeOpacity 는
       JS 경로라 r 과 같은 시계를 본다 */
  const innerTimes = [0, T_UNDRAW, T_UNDRAW + 0.04, T_GONE, 1]

  return (
    <div className={cls} aria-hidden>
      {/* 유령 링 — 본 링보다 뒤에, 조금 늦은 각도로 */}
      <motion.div className="hero-drop-layer" style={{ transform: ghostTransform }}>
        <svg className="hero-drop-svg" viewBox="0 0 240 240" focusable="false">
          {[ARC_LEFT, ARC_RIGHT].map((d) => (
            <motion.path
              key={d}
              className="hero-drop-ghost"
              d={d}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: ringLength, opacity: ghostOpacity }}
              transition={loop({ times: ghostTimes })}
            />
          ))}
        </svg>
      </motion.div>

      {/* 본 링 — 후광(넓은 옅은 선) 위에 선(blue-50). 둘이 같은 길이로 그려진다 */}
      <motion.div className="hero-drop-layer" style={{ transform: ringTransform }}>
        <svg className="hero-drop-svg" viewBox="0 0 240 240" focusable="false">
          {[ARC_LEFT, ARC_RIGHT].map((d) => (
            <motion.path
              key={`glow-${d}`}
              className="hero-drop-ring-glow"
              d={d}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: ringLength, opacity: ringOpacity }}
              transition={loop({ times: ringTimes, ease: ringEase })}
            />
          ))}
          {[ARC_LEFT, ARC_RIGHT].map((d) => (
            <motion.path
              key={d}
              className="hero-drop-ring"
              d={d}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: ringLength, opacity: ringOpacity }}
              transition={loop({ times: ringTimes, ease: ringEase })}
            />
          ))}
        </svg>
      </motion.div>

      {/* 코어 층 — 돌지 않는다. 후광 · 꼬리 · 머리(=씨앗=코어) · 안쪽 링 */}
      <div className="hero-drop-layer">
        <svg className="hero-drop-svg" viewBox="0 0 240 240" focusable="false">
          <motion.circle
            className="hero-drop-halo"
            cx={C}
            initial={{ cy: SEED_Y, r: SEED_R * HALO_X }}
            animate={{ cy: coreY, r: coreR.map((r) => r * HALO_X) }}
            transition={loop({ times: coreTimes, ease: coreEase })}
          />
          <motion.path
            className="hero-drop-core"
            initial={{ d: tailD[0] }}
            animate={{ d: tailD }}
            transition={loop({ times: tailTimes, ease: tailEase })}
          />
          <motion.circle
            className="hero-drop-core"
            cx={C}
            initial={{ cy: SEED_Y, r: SEED_R }}
            animate={{ cy: coreY, r: coreR }}
            transition={loop({ times: coreTimes, ease: coreEase })}
          />
          <motion.circle
            className="hero-drop-inner"
            cx={C}
            cy={C}
            initial={{ r: INNER_FROM, strokeOpacity: 0 }}
            animate={{ r: [INNER_FROM, INNER_FROM, INNER_FROM + 2, INNER_TO, INNER_TO], strokeOpacity: [0, 0, 0.8, 0, 0] }}
            transition={loop({ times: innerTimes, ease: 'easeOut' })}
          />
        </svg>
      </div>
    </div>
  )
}
