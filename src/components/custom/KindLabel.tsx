import { FileVideo, FolderOpen, Image as ImageIcon } from 'lucide-react'
import './KindLabel.css'

/**
 * 파일 종류 — **배지가 아니라 글리프다** (2026-08-25 사용자 확정).
 *
 * 잠깐 배지(초록 선 이미지 · 보라 선 영상)로 그렸다가 걷어냈다. 이 값이 서는 자리는 표의 한 칸과
 * 상세의 「구성」 줄인데, 둘 다 **같은 줄에 이미 배지가 있다** — 표에는 상태 배지, 상세 머리에는
 * 분류·구성·출처. 알약이 한 줄에 둘씩 서면 어느 쪽이 상태이고 어느 쪽이 종류인지 모양으로 안 갈린다.
 * 껍데기를 벗고 글리프만 두면 종류는 **그림 하나로** 읽히고 알약은 상태 몫으로 남는다.
 *
 * 셋뿐이다 — 이미지 · 영상 · 데이터셋. **셋 다 2026-08-25 사용자 확정**이며, 후보를 실제 표
 * 크기(18)로 나란히 놓고 고른 것이다:
 *
 *   이미지     사진 한 장(Image)      획이 가장 적어 18 에서 안 뭉갠다. 겹친 사진(Images)은
 *                                    겹친 자리가 붙어 한 덩어리로 보였다
 *   영상       영상 파일(FileVideo)   필름(Film)은 작은 칸이 여섯이라 촘촘했다. 파일 + 재생
 *                                    표시라 「받는 것」이라는 이 표의 성격과도 맞는다
 *   데이터셋   열린 폴더(FolderOpen)  닫힌 폴더보다 안이 트여 있어 **묶음**으로 읽힌다
 *
 * ★ 데이터셋에 원통(Database)을 쓰지 않는다. 이 포털에서 원통은 이미 「내 학습데이터」라는
 *   **자리 이름**을 맡고 있어(좌측 메뉴 · 대시보드 카드), 같은 그림을 표 안에서 종류로 다시
 *   쓰면 무엇을 가리키는지 갈리지 않는다.
 *   ※ 데이터 현황(SCREEN-029) KPI 카드는 아직 원통을 쓴다. 그쪽까지 맞출지는 별건이다.
 *
 * **꼴이 둘이고 이름이 옆에 서느냐가 가른다:**
 *
 *   기본       글리프 + 이름   상세의 「구성」 줄처럼 이 값 하나만 서는 자리
 *   iconOnly   글리프만        표의 한 칸 — 줄마다 같은 세 낱말이 반복되는 자리
 *
 * 표에서 이름을 떼는 이유는 **일곱 줄에 같은 낱말이 일곱 번 서기 때문**이다. 눈이 실제로 하는 일은
 * 낱말을 읽는 것이 아니라 같은 것끼리 묶는 것이고, 그건 그림이 글자보다 빠르다. 대신 이름을 뗀
 * 만큼 **표 위에 범례(`KindLegend`)를 세운다** — 글리프 셋이 무엇인지는 한 번만 말하면 된다.
 * 글자 없이 서는 글리프는 그 자체가 값이므로 표 셀 글자색·단독 크기(design.md §8 「단독 20」)를
 * 받고, 보조기술에는 `role="img"` + 이름으로 읽힌다.
 */
const KIND = {
  IMAGE: { label: '이미지', Icon: ImageIcon },
  VIDEO: { label: '영상', Icon: FileVideo },
  DATASET: { label: '데이터셋', Icon: FolderOpen },
} as const

export type DataKind = keyof typeof KIND

/** 범례가 세우는 순서 — 낱장(이미지) → 한 편(영상) → 묶음(데이터셋). 담는 단위가 커지는 차례다 */
const KIND_ORDER = ['IMAGE', 'VIDEO', 'DATASET'] as const

export function KindLabel({ kind, iconOnly = false }: { kind: DataKind; iconOnly?: boolean }) {
  const { label, Icon } = KIND[kind]
  if (iconOnly) {
    return (
      <span className="klid-kind-label" data-icon-only role="img" aria-label={label}>
        <Icon aria-hidden />
      </span>
    )
  }
  return (
    <span className="klid-kind-label">
      <Icon aria-hidden />
      {label}
    </span>
  )
}

/**
 * 종류 범례 — 표에서 이름을 뗀 글리프가 무엇인지 **한 번만** 말하는 줄.
 *
 * 표 바로 위(결과 머리)에 선다. 표 안에 두면 줄마다 따라다니고, 표 아래에 두면 다 읽고 난 뒤에야
 * 만난다.
 *
 * ★ `타입` 머리말을 뗐다 (2026-08-25 사용자 확정). 앞서 이 줄이 **어느 칸의 열쇠인지** 말하려고
 * 붙여 뒀는데, 바로 아래 표에 `타입` 열 머리글이 이미 서 있어 같은 낱말이 두 줄 연속으로
 * 반복됐다. 글리프 셋이 표의 그 칸과 같은 그림이라 열쇠라는 것은 머리말 없이도 읽힌다.
 */
export function KindLegend() {
  return (
    <p className="klid-kind-legend">
      {KIND_ORDER.map((kind) => (
        <KindLabel key={kind} kind={kind} />
      ))}
    </p>
  )
}
