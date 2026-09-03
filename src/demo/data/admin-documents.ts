import { DEMO_CATEGORIES } from './chat'

/**
 * 문서 관리 화면(관리자)의 데모 자료.
 *
 * ★ **문서명 · 파일명 · 용량 · 쪽수는 실물이다.** `docs/file_sample` 에 있는 실제 보고서를
 *   그대로 옮겼고 용량은 바이트까지 실측이다. 대화 화면의 근거 자료(`chat.ts`)와 같은
 *   원칙이다 — 지어낸 값이 실제 보고서의 값인 것처럼 보이면 그 화면을 근거로 이야기가 오간다.
 *   쪽수를 못 읽은 문서는 `null` 로 둔다. 그럴듯한 수를 채우지 않는다.
 *
 * ★ **색인 상태 · 조각 수 · 등록일 · 공개 여부는 데모값이다.** 보고서가 가진 값이 아니라
 *   시스템이 만드는 운영값이라, 화면이 어떤 상태를 그려야 하는지 보여 주려고 골라 넣었다.
 *   실연동에서는 색인 파이프라인이 돌려준다.
 *
 * ★ 카테고리는 대화 화면과 **같은 목록을 읽는다** (`DEMO_CATEGORIES`). 관리자가 매기는
 *   갈래와 이용자가 검색 범위로 고르는 갈래는 같은 것이라, 두 벌로 두면 곧 갈린다.
 */

/** 색인 상태 — 시스템이 정한다. 운영자가 손으로 바꾸는 값이 아니다 */
export type IndexStatus = 'INDEXED' | 'INDEXING' | 'FAILED'

export const INDEX_STATUS: Record<IndexStatus, string> = {
  INDEXED: '색인 완료',
  INDEXING: '색인 중',
  FAILED: '색인 실패',
}

export interface AdminDocument {
  id: string
  /** 화면에 서는 문서명 */
  title: string
  /** 올린 파일 이름. 문서명과 다를 수 있어 따로 적는다 */
  fileName: string
  categoryId: string
  /** 파일 크기 (바이트). 실측값 */
  bytes: number
  /** 쪽수. 읽지 못한 문서는 null */
  pageCount: number | null
  /** 잘라 넣은 조각 수. 색인이 끝나야 정해진다 */
  chunkCount: number | null
  status: IndexStatus
  /** 색인이 실패한 사유. FAILED 일 때만 채워진다 */
  failReason?: string
  registeredAt: string
  /** 챗봇이 이 문서를 근거로 쓸 수 있는가. 운영자가 정한다 */
  published: boolean
}

export const CATEGORY_NAME = Object.fromEntries(
  DEMO_CATEGORIES.map((c) => [c.categoryId, c.categoryName]),
) as Record<string, string>

export const ADMIN_DOCUMENTS: AdminDocument[] = [
  {
    id: 'doc-001',
    title: '2021년도 방사선 및 방사성동위원소 이용실태조사 보고서',
    fileName: '2021년도 방사선 및 방사성동위원소 이용실태조사 보고서.pdf',
    categoryId: 'survey',
    bytes: 7078358,
    pageCount: 410,
    chunkCount: 1284,
    status: 'INDEXED',
    registeredAt: '2026.08.11',
    published: true,
  },
  {
    id: 'doc-002',
    title: '2023년도 방사선 및 방사성동위원소 이용실태조사 보고서(부록)',
    fileName: '2023년도 방사선 및 방사성동위원소 이용실태조사 보고서(부록)_최종.pdf',
    categoryId: 'survey',
    bytes: 49682759,
    /* 쪽수를 읽지 못했다 — 스캔본이라 글자층이 없다 (chat.ts 와 같은 사정) */
    pageCount: null,
    chunkCount: null,
    status: 'FAILED',
    failReason: '글자층이 없는 스캔본입니다. 문자 인식(OCR)을 먼저 거쳐야 합니다.',
    registeredAt: '2026.08.11',
    published: false,
  },
  {
    id: 'doc-003',
    title: '[2025 이슈페이퍼] 방사성의약품 신약 개발 현황과 전망',
    fileName: '[2025 이슈페이퍼] 방사성의약품 신약 개발 현황과 전망.pdf',
    categoryId: 'issue',
    bytes: 1201167,
    pageCount: 13,
    chunkCount: 47,
    status: 'INDEXED',
    registeredAt: '2026.08.12',
    published: true,
  },
  {
    id: 'doc-004',
    title: '[2025 이슈페이퍼] 후쿠시마 사고 전후의 방사능방재법 제개정 연혁 분석과 시사점',
    fileName: '[2025 이슈페이퍼] 후쿠시마 사고 전후의 방사능방재법 제개정 연혁 분석과 시사점.pdf',
    categoryId: 'issue',
    bytes: 1222274,
    pageCount: 23,
    chunkCount: 81,
    status: 'INDEXED',
    registeredAt: '2026.08.12',
    published: true,
  },
  {
    id: 'doc-005',
    title: '[2025 KARA RT REPORT] AI 기반 의료영상 분야 시장분석보고서',
    fileName: '[2025 KARA RT REPORT] AI 기반 의료영상 분야 시장분석보고서.pdf',
    categoryId: 'market',
    bytes: 2495901,
    pageCount: 22,
    chunkCount: 76,
    status: 'INDEXED',
    registeredAt: '2026.08.18',
    published: true,
  },
  {
    id: 'doc-006',
    title: '[2023 RT REPORT No.4-1] 세계 방사선치료 시장 현황 및 전망 Ⅰ',
    fileName: '[2023 RT REPORT No.4-1] 세계 방사선치료 시장 현황 및 전망 Ⅰ.pdf',
    categoryId: 'market',
    bytes: 2400389,
    pageCount: 32,
    chunkCount: null,
    status: 'INDEXING',
    registeredAt: '2026.09.03',
    published: false,
  },
  {
    id: 'doc-007',
    title: '[학회리뷰보고서 No.12] ACNS 2026',
    fileName: '[학회리뷰보고서 No.12] ACNS 2026.pdf',
    categoryId: 'review',
    bytes: 4215653,
    pageCount: 14,
    chunkCount: 52,
    status: 'INDEXED',
    registeredAt: '2026.08.25',
    published: true,
  },
  {
    id: 'doc-008',
    title: '[학회리뷰보고서 No.11] IEEE RT2026',
    fileName: '[학회리뷰보고서 No.11] IEEE RT2026.pdf',
    categoryId: 'review',
    bytes: 5291169,
    pageCount: 24,
    chunkCount: 90,
    status: 'INDEXED',
    registeredAt: '2026.08.25',
    /* 색인은 끝났지만 아직 안 여는 문서 — 「색인 완료 · 비공개」가 따로 서는 자리다 */
    published: false,
  },
  {
    id: 'doc-009',
    title: '각론 5. 방사선 이용기관 안전규제 국내외 비교',
    fileName: '각론 5. 방사선 이용기관 안전규제 국내외 비교.pdf',
    categoryId: 'law',
    bytes: 1005398,
    pageCount: 18,
    chunkCount: 63,
    status: 'INDEXED',
    registeredAt: '2026.08.28',
    published: true,
  },
  {
    id: 'doc-010',
    title: '총론. 방사선 안전규제에 관한 법제도 비교 분석',
    fileName: '총론. 방사선 안전규제에 관한 법제도 비교 분석.pdf',
    categoryId: 'law',
    bytes: 1045677,
    pageCount: null,
    chunkCount: 154,
    status: 'INDEXED',
    registeredAt: '2026.08.28',
    published: true,
  },
]

/**
 * 카테고리별 실제 보유 건수 (`docs/file_sample` 실측).
 * 목록에는 위 열 건만 실려 있지만 KPI 와 조건 줄의 건수는 이 값을 읽는다 — 화면이
 * 「전체 몇 건을 상대하는 화면인지」를 실제 규모로 말해야 하기 때문이다.
 */
export const CORPUS_COUNT: Record<string, number> = {
  survey: 22,
  issue: 42,
  market: 78,
  review: 12,
  law: 17,
  /* 아직 한 건도 안 들어온 갈래 — DB 정비 대상이지만 수집 전이다 */
  biz: 0,
}

export const CORPUS_TOTAL = Object.values(CORPUS_COUNT).reduce((a, b) => a + b, 0)
