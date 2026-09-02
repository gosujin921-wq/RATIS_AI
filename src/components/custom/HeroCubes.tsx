import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Environment, Lightformer, ContactShadows } from '@react-three/drei'
import { useReducedMotion } from './useReducedMotion'
import * as THREE from 'three'
import './HeroCubes.css'

/**
 * 히어로 3D 큐브 클러스터 — "증식(분열)" 루프.
 * 1개 큰 큐브 → 갈라질 축으로 길어졌다 둘로 분할 → 벌어진 채 잠시 멈춤 → 제자리로 이동
 * → 재귀 분열 → 최종 클러스터(잠시 유영) → 다시 하나로 합쳐짐(역재생) → 반복.
 * 분할·이동을 단계로 분리해 "결과 좌표로 배치"가 아니라 "쪼개진 뒤 흘러가는" 인상을 줌.
 * 메탈릭 로열블루, 다이아몬드 포즈. 잎 큐브는 미세하게 떠다니는 idle 모션.
 *
 * 출처: KLID 포털 1차 목업의 랜딩 A안 히어로(아카이브본)를 그대로 가져왔다.
 * 원본과 다른 점은 두 가지뿐이다:
 *   - useReducedMotion 을 motion/react 대신 로컬 훅(./useReducedMotion)으로 교체
 *   - 래퍼의 Tailwind `absolute inset-0` 을 HeroCubes.css 로 교체 (KRDS 충돌 회피)
 *
 * 부모가 position: relative 와 높이를 잡아 줘야 보인다 (캔버스가 absolute inset:0).
 * centered 를 주면 클러스터가 캔버스 한가운데 온다 — 대화 시작 화면(SCREEN-001)의 오브 용도.
 */

/**
 * 격자 좌표. 3칸(=최대 27칸)이라 잎 큐브가 십수 개에서 끝난다.
 * 4칸(원본, 64칸 → 잎 53개)이면 분열 트리가 6~7세대까지 가서 한 바퀴가 늘어진다.
 * 간격 1.5 · 큐브 1.15 로 키워, 개수는 줄이되 덩어리 크기는 원본과 비슷하게 유지한다.
 */
const COORDS = [-1.5, 0, 1.5]
/** 격자에서 남길 큐브 수. 여기에 위성 큐브가 더해져 최종 개수가 된다 */
const GRID_LEAVES = 14
/**
 * RATIS CI 팔레트. 블루 #273996 · 그린 #91c73d 를 앵커로, 인접 큐브가 구분되게 톤만 나눴다.
 *
 * 그린을 섞는 건 장식이 아니라 CI 를 따른 것이다 — 로고의 흩날리는 사각형이 블루·그린
 * 두 색이고, CI 설명이 그걸 「라티스에서 퍼져나가는 맞춤형 정보」라고 적고 있다.
 * 이 오브가 그 사각형의 3D 판이라 같은 두 색을 쓴다.
 *
 * 그린은 6개 중 2개(≈3분의 1)만 — 로고의 비율이다. 더 넣으면 브랜드가 초록으로 읽힌다.
 */
const PALETTE = ['#273996', '#2f47b4', '#3a56cf', '#1e2d78', '#91c73d', '#a8d95a']
const MAX_DIST = 2.3 // 꼭짓점 8칸을 떨궈 19칸을 남긴다 (모서리 2.121 < 2.3 < 대각 2.598)
/**
 * ★ 전체 속도 배수 — 이 애니메이션의 "텐션" 다이얼.
 *
 * 시간 상수를 **모두 같은 배수로** 나누므로 아래 두 제약(STEP−STRETCH_T ≥ GROW,
 * STEP−MERGE_GROW ≥ STRETCH_T)은 배수와 무관하게 그대로 지켜진다.
 *
 * 잎 큐브 16개 기준 분열 트리는 5~7세대이고, 지금 값(1.75)에서 한 바퀴가 12~15초다.
 * 1 로 되돌리면 20~26초. 키울수록 팽팽하고 빨라진다.
 */
const TEMPO = 1.75
const STEP = 1.25 / TEMPO // 한 세대(분열) 간격
// 분할+이동 전체 시간. STEP - STRETCH_T ≥ GROW 이어야 함:
// 완전히 자리 잡은 뒤에야 다음 분열 스트레치 시작 → 이동 중 늘어나며 이웃을 침범하지 않음
const GROW = 0.85 / TEMPO
// 분열을 "분할 → 잠시 멈춤 → 이동" 3단계로 분리:
// 결과 좌표로 곧장 날아가지 않고, 먼저 분열축으로만 쪼개져 벌어진 뒤 제자리로 흘러간다
const SPLIT_FRAC = 0.38 // GROW 중 분할(축 방향으로 벌어지는) 구간 비율
const HOLD_FRAC = 0.12 // 분할 직후 벌어진 채 머무는 구간 비율
const SPLIT_SEP = 0.3 // 분할 직후 추가로 벌어지는 거리(부모 크기 배수, 최종 축좌표 한도 내)
const STRETCH_T = 0.4 / TEMPO // 분열 직전 길어지는 시간
// 합체 시 이동 시간. STEP - MERGE_GROW ≥ STRETCH_T 이어야 함:
// 임팩트 출렁임이 완전히 끝나 순수 정육면체가 된 뒤에만 다음 합체를 향해 이동 시작
// → 이동 중 형태가 항상 큐브라서 면 접촉 계산이 정확하고, 서로 파고들지 않음
const MERGE_GROW = 0.55 / TEMPO
const ELONG = 1.7 // 갈라질 축으로 길어지는 배율(바 형태)
const PULL_THIN = 0.14 // 당겨지는 동안 단면이 가늘어지는 비율(장력 표현)
const JELLY = 0.22 // 분리 직후 젤리 출렁임 진폭
const SETTLE_T = 0.5 / TEMPO // 도착 직후 착지 텐션 지속 시간
const SETTLE_AMP = 0.085 // 착지 텐션 진폭 (이웃 간격 침범 없는 한도)
const ZOOM_SINGLE = 1.55 // 단일 큐브 구간 줌 인 배율 (분열 진행에 따라 1.0으로 줌 아웃)
const SPLIT_ACCEL = 1.9 // 분열 템포 워프 지수: 1=등속, 클수록 "느리게 시작 → 점점 빠르게"
const HOLD_CLUSTER = 3.6 / TEMPO // 분열 완료 후 클러스터 유지(유영) 시간
const HOLD_SINGLE = 1.4 / TEMPO // 합쳐진 뒤 단일 큐브 유지 시간
const FLOAT_AMP = 0.03 // 잎 큐브 유영 진폭 (겹침 방지 위해 작게)
const LEAF_SIZE = 1.15 // 잎 큐브 균일 크기 (간격 1.5 대비 여유를 둬 덩어리짐 방지)
// 클러스터 가로 위치. 원본 랜딩은 좌측에 문구가 들어와 우측(2.7)으로 밀어 뒀다.
// centered 로 쓰면 0 — 캔버스 한가운데.
const OFFSET_X = 2.7
/** smootherstep — 가감속이 더 완만해 자연스러운 이징 */
const smooth = (x: number) => x * x * x * (x * (x * 6 - 15) + 10)
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const tmpFrom = new THREE.Vector3()
const tmpMid = new THREE.Vector3()

interface Leaf {
  pos: THREE.Vector3
  size: number
  color: string
  roughness: number
}

/** 분열 트리 노드 (내부 노드 = 분열 전 큰 큐브, 잎 = 최종 큐브) */
interface Node {
  centroid: THREE.Vector3
  size: number
  depth: number
  parent: number
  isLeaf: boolean
  splitAxis: number // 내부 노드가 갈라지는 축 (0:x 1:y 2:z), 잎은 -1
  color: string
  roughness: number
}

function makeLeaves(): Leaf[] {
  const pts: THREE.Vector3[] = []
  const JITTER = 0.06 // 자리 흐트러뜨림 (영역 침범 없는 한도)
  const r = () => (Math.random() * 2 - 1) * JITTER
  for (const x of COORDS)
    for (const y of COORDS)
      for (const z of COORDS) {
        if (Math.hypot(x, y, z) > MAX_DIST) continue
        pts.push(new THREE.Vector3(x + r(), y + r(), z + r()))
      }
  /* 후보 19칸에서 GRID_LEAVES 개만 남긴다.
     원본은 칸마다 확률로 걸러 개수가 들쭉날쭉했는데, 개수가 분열 세대 수를 정하므로
     (16개면 4세대) 여기서 못박아야 루프 길이가 매번 같다. 빠지는 자리는 매번 달라진다 */
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pts[i], pts[j]] = [pts[j], pts[i]]
  }
  pts.length = Math.min(pts.length, GRID_LEAVES)

  // 본체에서 떨어져 나온 위성 큐브 (유기적 실루엣). 격자 한 칸 바깥에 둔다
  const OUTLIERS: [number, number, number][] = [
    [3, 1.5, 0],
    [-3, 0, 1.5],
  ]
  for (const [x, y, z] of OUTLIERS) pts.push(new THREE.Vector3(x + r(), y + r(), z + r()))

  return pts.map((pos) => {
    return {
      pos,
      size: LEAF_SIZE,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      roughness: 0.16 + Math.random() * 0.16, // 큐브별 러프니스 편차를 키워 면 구분이 보이게
    }
  })
}

function useNodes(): Node[] {
  return useMemo(() => {
    const nodes: Node[] = []

    const build = (items: Leaf[], depth: number, parent: number) => {
      const centroid = new THREE.Vector3()
      for (const it of items) centroid.add(it.pos)
      centroid.multiplyScalar(1 / items.length)

      if (items.length === 1) {
        const lf = items[0]
        nodes.push({
          centroid: lf.pos.clone(),
          size: lf.size,
          depth,
          parent,
          isLeaf: true,
          splitAxis: -1,
          color: lf.color,
          roughness: lf.roughness,
        })
        return
      }

      const idx = nodes.length

      // 가장 긴 축에서 중앙값으로 둘로 분할
      const min = new THREE.Vector3(Infinity, Infinity, Infinity)
      const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity)
      for (const it of items) {
        min.min(it.pos)
        max.max(it.pos)
      }
      const ext = max.clone().sub(min)
      const axis = ext.x >= ext.y && ext.x >= ext.z ? 0 : ext.y >= ext.z ? 1 : 2

      // 영역 준수: 노드 큐브(및 ELONG배 늘어난 바)가 자기 서브트리 바운딩 박스를
      // 절대 벗어나지 않게 크기를 제한 → 형제·사촌 가지와 영원히 겹치지 않음
      const allowX = ext.x + LEAF_SIZE
      const allowY = ext.y + LEAF_SIZE
      const allowZ = ext.z + LEAF_SIZE
      const allowAxis = [allowX, allowY, allowZ][axis]
      const size = Math.min(0.62 * Math.cbrt(items.length), 2.0, allowX, allowY, allowZ, allowAxis / ELONG)

      // 위치도 무게중심 대신 박스 중심: 영역 안 대칭 배치 보장
      const boxCenter = min.clone().add(max).multiplyScalar(0.5)

      nodes.push({
        centroid: boxCenter,
        size,
        depth,
        parent,
        isLeaf: false,
        splitAxis: axis,
        color: '#3f72ff',
        roughness: 0.16,
      })

      const sorted = [...items].sort((a, b) => a.pos.getComponent(axis) - b.pos.getComponent(axis))
      // 분할점은 반드시 좌표 "간격"(빈 공간)에서 고른다. 단순 중앙값 분할은 같은 축좌표를
      // 가진 점들이 양쪽 자식으로 갈리는 걸 허용 → 두 자식 영역이 겹쳐 이동 중 큐브가
      // 서로 파고듦. 간격(격자 기준 ≥1.0) 중 중앙에 가장 가까운 곳에서 가른다
      let mid = -1
      let bestDist = Infinity
      for (let k = 1; k < sorted.length; k++) {
        const gap = sorted[k].pos.getComponent(axis) - sorted[k - 1].pos.getComponent(axis)
        if (gap < 0.5) continue
        const d = Math.abs(k - sorted.length / 2)
        if (d < bestDist) {
          bestDist = d
          mid = k
        }
      }
      if (mid < 0) mid = Math.floor(sorted.length / 2) // 안전망: 간격이 없으면 중앙 분할
      build(sorted.slice(0, mid), depth + 1, idx)
      build(sorted.slice(mid), depth + 1, idx)
    }

    build(makeLeaves(), 0, -1)
    return nodes
  }, [])
}

function Cluster({ offsetX }: { offsetX: number }) {
  const reduce = useReducedMotion()
  const group = useRef<THREE.Group>(null!)
  const nodes = useNodes()
  const refs = useRef<(THREE.Mesh | null)[]>([])

  // 자식이 부모 바(bar)의 어느 쪽 끝에서 나오는지 (-1 | +1)
  const signs = useMemo(
    () =>
      nodes.map((n) => {
        if (n.parent < 0) return 1
        const p = nodes[n.parent]
        const d = n.centroid.getComponent(p.splitAxis) - p.centroid.getComponent(p.splitAxis)
        return d >= 0 ? 1 : -1
      }),
    [nodes],
  )

  // 합체 접촉 시점의 부모 형태: 두 자식 큐브가 면을 맞댄 모양(길이 = 자식 크기 합, 단면 = 자식 평균)
  const contact = useMemo(
    () =>
      nodes.map((n, i) => {
        if (n.isLeaf) return { elong: 1, cross: 1 }
        let sum = 0
        for (const c of nodes) if (c.parent === i) sum += c.size
        return {
          elong: Math.min(sum / n.size, ELONG),
          cross: Math.min(sum / 2 / n.size, 1),
        }
      }),
    [nodes],
  )

  // 분열 완료 시각 D + 루프 길이
  const maxDepth = useMemo(() => nodes.reduce((m, n) => Math.max(m, n.depth), 0), [nodes])
  // 버퍼는 SETTLE_T보다 길게: 마지막 세대의 착지 텐션이 끝난 뒤에 타임라인이 멈춰야
  // 클러스터 유영 구간에서 변형이 얼어붙지 않음
  const D = maxDepth * STEP + GROW + SETTLE_T + 0.1
  const CYCLE = D + HOLD_CLUSTER + D + HOLD_SINGLE

  useFrame((state) => {
    const real = state.clock.elapsedTime

    // 루프 타임라인: 분열(D) → 클러스터 유영(HOLD_CLUSTER) → 합체(D, 별도 다이내믹) → 단일 큐브(HOLD_SINGLE)
    const tc = real % CYCLE
    let t: number
    let merging = false
    // 분열 구간 템포 워프: 첫 분열은 천천히(장력 쌓임), 세대가 깊어질수록 가속(연쇄 폭발).
    // 전체 길이 D는 보존되고, 줌·분열·착지 디테일이 모두 같은 시계를 타므로 일관됨
    if (tc < D) t = D * Math.pow(tc / D, SPLIT_ACCEL)
    else if (tc < D + HOLD_CLUSTER) t = D
    else if (tc < D + HOLD_CLUSTER + D) {
      t = D - (tc - D - HOLD_CLUSTER)
      merging = true
    } else t = 0

    nodes.forEach((n, j) => {
      const m = refs.current[j]
      if (!m) return

      if (reduce) {
        m.visible = n.isLeaf
        if (n.isLeaf) {
          m.position.copy(n.centroid)
          m.scale.setScalar(n.size)
        }
        return
      }

      const birth = n.depth * STEP
      const death = n.isLeaf ? Infinity : (n.depth + 1) * STEP
      // 부모는 분열 순간 즉시 사라짐 (자식 반쪽 둘이 같은 부피를 정확히 타일링하므로 교체가 보이지 않음)
      if (t < birth || t >= death) {
        m.visible = false
        return
      }
      m.visible = true

      // 등장: 부모 바의 반쪽(바를 정확히 반반 나눈 형태)에서 시작
      const u = clamp01((t - birth) / (merging ? MERGE_GROW : GROW))
      // 분열 3단계 진행도
      // 1) 분할: 분열축으로만 벌어지며 정육면체로 복원 (장력 풀리듯 ease-out)
      // 2) 멈춤: 벌어진 채 잠시 머무름 (쪼개졌다는 사실이 먼저 읽히게)
      // 3) 이동: 자기 자리로 유영하듯 글라이드 (smootherstep, 오버슈트 없음)
      const uSplit = clamp01(u / SPLIT_FRAC)
      const uMove = clamp01((u - SPLIT_FRAC - HOLD_FRAC) / (1 - SPLIT_FRAC - HOLD_FRAC))
      // 형태 복원(반쪽 바 → 정육면체)은 전체 구간에 걸쳐 진행: 자리 잡을 때 비로소 풀사이즈
      // → 아직 가까이 있는 형제·사촌끼리 풀사이즈로 겹치는 일이 없음 (영역 보장의 전제)
      const ae = smooth(u)
      let fromSx: number
      let fromSy: number
      let fromSz: number
      if (n.parent < 0) {
        tmpFrom.copy(n.centroid)
        fromSx = fromSy = fromSz = n.size
        m.position.copy(n.centroid)
      } else {
        const p = nodes[n.parent]
        tmpFrom.copy(p.centroid)
        if (merging) {
          // 합체: 자기 모양(정육면체) 그대로, 부모 중심에서 면이 맞닿는 위치까지만 이동
          // → "가까이 있던 것이 다가와 붙는" 느낌 (멀리서 조립 X)
          // 자석처럼 천천히 끌리다 가속해서 달라붙음 (역재생 시 ease-in이 되는 ease-out)
          tmpFrom.setComponent(
            p.splitAxis,
            tmpFrom.getComponent(p.splitAxis) + signs[j] * (n.size / 2),
          )
          fromSx = fromSy = fromSz = n.size
          m.position.lerpVectors(tmpFrom, n.centroid, 1 - Math.pow(1 - u, 3))
        } else {
          // 분열: 부모 바의 반쪽에서 시작 (반쪽 바 중심 = ±부모길이/4)
          tmpFrom.setComponent(
            p.splitAxis,
            tmpFrom.getComponent(p.splitAxis) + signs[j] * p.size * ELONG * 0.25,
          )
          // 분할 종점: 결과 좌표가 아니라, 분열축으로만 SPLIT_SEP만큼 더 벌어진 자리.
          // 단 자기 최종 좌표의 축 성분을 넘지 않게 클램프 → 자기 영역 밖(사촌 영역)으로
          // 튀어나갔다 되돌아오는 경로가 생기지 않아 이동 중 서로 겹치지 않음
          const cBase = p.size * ELONG * 0.25
          const cFinal = Math.abs(
            n.centroid.getComponent(p.splitAxis) - p.centroid.getComponent(p.splitAxis),
          )
          const c = Math.min(cBase + p.size * SPLIT_SEP, Math.max(cBase, cFinal))
          tmpMid.copy(p.centroid)
          tmpMid.setComponent(p.splitAxis, tmpMid.getComponent(p.splitAxis) + signs[j] * c)
          // 반쪽 바의 크기 = 분열축으로 부모길이/2, 나머지 축은 당겨져 가늘어진 단면 그대로
          fromSx = fromSy = fromSz = p.size * (1 - PULL_THIN)
          const half = (p.size * ELONG) / 2
          if (p.splitAxis === 0) fromSx = half
          else if (p.splitAxis === 1) fromSy = half
          else fromSz = half
          if (uMove <= 0) {
            const easeSplit = 1 - Math.pow(1 - uSplit, 3)
            m.position.lerpVectors(tmpFrom, tmpMid, easeSplit)
          } else {
            m.position.lerpVectors(tmpMid, n.centroid, smooth(uMove))
          }
        }
      }
      let sx = THREE.MathUtils.lerp(fromSx, n.size, ae)
      let sy = THREE.MathUtils.lerp(fromSy, n.size, ae)
      let sz = THREE.MathUtils.lerp(fromSz, n.size, ae)

      // 분리 직후 젤리 출렁임: 이동 방향(부모 분열축)으로 늘었다 줄었다 감쇠 진동
      // 분열 전용. 잎에만 적용 (중간 노드 바는 영역을 침범할 수 있어 제외)
      if (!merging && n.isLeaf && n.parent >= 0 && u < 1) {
        const w = Math.sin(u * Math.PI * 3) * (1 - u) * (1 - u) * JELLY
        const along = 1 + w
        const cross = 1 - w * 0.45
        const pAxis = nodes[n.parent].splitAxis
        if (pAxis === 0) {
          sx *= along
          sy *= cross
          sz *= cross
        } else if (pAxis === 1) {
          sy *= along
          sx *= cross
          sz *= cross
        } else {
          sz *= along
          sx *= cross
          sy *= cross
        }
      }

      // 착지 텐션: 이동이 멈추는 순간 진행 방향으로 살짝 눌렸다 출렁이며 정착
      // (합체 임팩트 스쿼시의 분열판 대응). 잎 전용, 감쇠 진동이라 이웃 침범 없음
      const ts = t - birth - GROW
      if (!merging && n.isLeaf && n.parent >= 0 && ts > 0 && ts < SETTLE_T) {
        const r = ts / SETTLE_T
        const w = Math.sin(r * Math.PI * 2) * (1 - r) * (1 - r) * SETTLE_AMP
        const along = 1 - w // 도착 직후 진행 방향으로 눌림 → 반동 → 정착
        const cross = 1 + w * 0.45
        const pAxis = nodes[n.parent].splitAxis
        if (pAxis === 0) {
          sx *= along
          sy *= cross
          sz *= cross
        } else if (pAxis === 1) {
          sy *= along
          sx *= cross
          sz *= cross
        } else {
          sz *= along
          sx *= cross
          sy *= cross
        }
      }

      // 분열축 변형 (분열/합체 다이내믹 분기)
      if (!n.isLeaf && t > death - STRETCH_T) {
        const q = clamp01((t - (death - STRETCH_T)) / STRETCH_T)
        let elong: number
        let thin: number
        if (merging) {
          // 합체: 접촉 순간(r=0)엔 두 자식이 면을 맞댄 모양 그대로 받아서
          // → 임팩트 스쿼시 → 출렁이며 부모 정육면체로 흡수 (감쇠 스프링)
          const r = 1 - q // 접촉 후 경과 (실시간 기준 0 → 1)
          const env = Math.exp(-2.5 * r) * Math.cos(r * Math.PI * 1.5)
          elong = 1 + (contact[j].elong - 1) * env
          thin = 1 + (contact[j].cross - 1) * env
        } else {
          // 분열: 장력이 쌓이듯 가속하며(ease-in) 길어지고 단면은 가늘어짐
          const qe = q * q * q
          elong = 1 + (ELONG - 1) * qe
          thin = 1 - PULL_THIN * qe
        }
        if (n.splitAxis === 0) {
          sx *= elong
          sy *= thin
          sz *= thin
        } else if (n.splitAxis === 1) {
          sy *= elong
          sx *= thin
          sz *= thin
        } else {
          sz *= elong
          sx *= thin
          sy *= thin
        }
      }

      // 잎 큐브 유영: 자리 잡은 정도(ae)만큼 미세한 부유 + 호흡 (실시간 기준이라 역재생 중에도 자연스러움)
      if (n.isLeaf) {
        const ph = j * 2.399 // 골든앵글 위상 분산
        const amp = FLOAT_AMP * ae
        m.position.y += Math.sin(real * (0.55 + (j % 5) * 0.07) + ph) * amp
        m.position.x += Math.cos(real * 0.45 + ph * 1.7) * amp * 0.6
        const breathe = 1 + Math.sin(real * 0.8 + ph) * 0.012 * ae
        sx *= breathe
        sy *= breathe
        sz *= breathe
      }
      m.scale.set(sx, sy, sz)
    })

    // 한 방향으로만 천천히 연속 회전 (실시간 기준이라 합체 리와인드 중에도 같은 방향 유지)
    if (group.current) {
      group.current.rotation.y = 0.5 + (reduce ? 0 : real * 0.1)
      group.current.rotation.x = -0.3 + (reduce ? 0 : Math.sin(real * 0.27) * 0.04)
      // 줌 연출: 단일 큐브일 땐 살짝 확대(ZOOM_SINGLE), 분열이 퍼질수록 줌 아웃.
      // t를 재사용하므로 합체 구간에선 자동으로 다시 줌 인. 클러스터 완성 시 1.0이라
      // 상단 여백 계산에 영향 없음
      group.current.scale.setScalar(
        reduce ? 1 : THREE.MathUtils.lerp(ZOOM_SINGLE, 1, smooth(clamp01(t / D))),
      )
    }
  })

  // y를 살짝 내리고 스케일 1.0: 분열 완료(위성 큐브 포함) 시에도 상단 여백 확보
  return (
    <group ref={group} position={[offsetX, -0.2, 0]} scale={1.0}>
      {nodes.map((n, j) => (
        <RoundedBox
          key={j}
          ref={(el) => {
            refs.current[j] = el
          }}
          args={[1, 1, 1]}
          radius={0.08}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color={n.color}
            metalness={0.62}
            roughness={n.roughness}
            clearcoat={0.6}
            clearcoatRoughness={0.18}
            envMapIntensity={1.3}
          />
        </RoundedBox>
      ))}
    </group>
  )
}

export function HeroCubes({ centered = false }: { centered?: boolean }) {
  const offsetX = centered ? 0 : OFFSET_X
  return (
    <div className="hero-cubes">
      <Canvas
        shadows
        camera={{ position: [0, 0, 13], fov: 40 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.55} />
        {/* 그림자 캐스팅: 큐브끼리 서로 그림자를 드리워 틈이 어두워지고 경계가 분리되어 보임 */}
        <directionalLight
          position={[4, 7, 6]}
          intensity={1.7}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={1}
          shadow-camera-far={30}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0004}
        />
        <Cluster offsetX={offsetX} />
        {/* 바닥 소프트 섀도: 클러스터를 공간에 앵커링 (공중 부유감 제거, 무게감) */}
        <ContactShadows
          position={[offsetX, -3.45, 0]}
          opacity={0.3}
          scale={10}
          blur={2.6}
          far={5}
          resolution={256}
          color="#1f2e92"
        />
        {/* 스튜디오 반사판 — 밝은 환경광으로 면을 밝은 블루로, 어두운 반사 방지 */}
        <Environment resolution={512}>
          {/* 흰 반사판 강도를 낮춰 윗면 화이트 블로우아웃 방지, 블루 틴트 유지 */}
          <Lightformer form="rect" intensity={4.5} position={[0, 7, 6]} scale={[20, 10, 1]} color="#eef5ff" />
          <Lightformer form="rect" intensity={3} position={[0, 0, 10]} scale={[16, 12, 1]} color="#dcebff" />
          <Lightformer form="rect" intensity={3} position={[-10, 2, 4]} scale={[8, 13, 1]} color="#cfe2ff" />
          <Lightformer form="rect" intensity={3.5} position={[10, -1, 4]} scale={[8, 13, 1]} color="#eaf2ff" />
          <Lightformer form="rect" intensity={2.5} position={[0, -7, -4]} scale={[16, 8, 1]} color="#b8d2ff" />
        </Environment>
      </Canvas>
    </div>
  )
}
