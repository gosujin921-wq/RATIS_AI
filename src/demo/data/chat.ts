/**
 * ★ 데모 전용 목업 데이터 — 실연동 시 src/demo/ 폴더째 삭제한다.
 *
 * 형태는 src/api/types.ts (API 계약 타입)를 그대로 따른다. 화면은 이 데이터가
 * 목업인지 실응답인지 모른다 — 그래서 API 클라이언트로 갈아끼워도 화면은 그대로다.
 */

import type { Category, ChatMessage, ConversationSummary, Evidence, Me } from '../../api/types'

/** API-031 목업 — 협회회원. GENERAL(초기 카테고리 0개)·ADMIN 데모는 추후 스토리로 */
export const DEMO_ME: Me = {
  displayName: '김방사',
  role: 'ASSOC',
}

/** API-017 목업 */
export const DEMO_CATEGORIES: Category[] = [
  { categoryId: 'c1', categoryName: '실태조사 통계표' },
  { categoryId: 'c2', categoryName: '전문보고서' },
  { categoryId: 'c3', categoryName: '정책·법령 자료' },
  { categoryId: 'c4', categoryName: '교육·행사 자료' },
]

/** API-001 목업 — 근거 유형 3종(INTERNAL/EXTERNAL/BLOCKED)을 한 번씩 보여준다 */
export const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    question: '2024년 방사선 이용기관 수는 어떻게 변했나요?',
    evidenceType: 'INTERNAL',
    composition: '요약',
    answer:
      '2024년 국내 방사선 이용기관은 총 9,132개소로 전년(8,874개소) 대비 약 2.9% 증가했습니다.\n\n분야별로는 산업체가 5,410개소로 가장 큰 비중을 차지했고, 의료기관 2,180개소, 연구기관 830개소, 교육기관 712개소 순입니다. 산업체와 의료기관의 증가가 전체 증가분의 대부분을 차지합니다.',
    followUps: ['비파괴검사 분야만 따로 볼 수 있나요?', '전년 대비 증감률도 알려주세요.'],
    evidences: [
      {
        chunkId: 'e1',
        documentTitle: '2024 방사선산업 실태조사 보고서',
        categoryName: '실태조사 통계표',
        tableTitle: '연도별 방사선 이용기관 현황',
        pageNo: 47,
        blockType: 'table',
        chunkContent:
          '<table><thead><tr><th>구분</th><th>2022</th><th>2023</th><th>2024</th></tr></thead><tbody><tr><td>산업체</td><td>5,102</td><td>5,261</td><td>5,410</td></tr><tr><td>의료기관</td><td>2,004</td><td>2,095</td><td>2,180</td></tr><tr><td>연구기관</td><td>801</td><td>815</td><td>830</td></tr><tr><td>교육기관</td><td>695</td><td>703</td><td>712</td></tr><tr><td>합계</td><td>8,602</td><td>8,874</td><td>9,132</td></tr></tbody></table>',
        caption: '단위: 개소 · 출처: 2024 방사선산업 실태조사 (한국방사선진흥협회)',
      },
      {
        chunkId: 'e2',
        documentTitle: '방사선 이용통계 연차분석',
        categoryName: '전문보고서',
        sectionName: '3.2 기관 수 추이',
        pageNo: 12,
        blockType: 'text',
        chunkContent:
          '최근 3년간 방사선 이용기관 수는 연평균 3% 내외의 완만한 증가세를 유지하고 있으며, 특히 비파괴검사 분야 산업체의 신규 등록이 증가세를 견인하고 있다.',
      },
    ],
  },
  {
    id: 'm2',
    question: '국내 방사선 분야 종사자의 평균 연봉 추이도 알 수 있어?',
    evidenceType: 'EXTERNAL',
    answer:
      '협회 보유 자료에서는 해당 근거를 찾지 못했습니다. 아래는 외부 생성형 AI의 일반 지식에 기반한 응답입니다.\n\n국내 방사선 분야 종사자의 보수 수준은 직군(방사선사, 비파괴검사원, 연구인력 등)에 따라 편차가 크며, 공개 통계로는 고용노동부 직종별 임금 통계 등을 참고할 수 있습니다.',
    notice: '내부 자료에서 근거를 찾지 못해 외부 LLM 응답을 표시합니다. 협회 문서에 근거한 답변이 아닙니다.',
    evidences: [],
  },
  {
    id: 'm3',
    question: '실태조사에 응답한 업체 담당자 연락처를 알려줘',
    evidenceType: 'BLOCKED',
    answer: null,
    notice: '개인정보에 해당하는 내용은 답변할 수 없습니다.',
    evidences: [],
  },
]

/** 새 질문에 붙여줄 데모 근거 — 실태조사 통계표 계열 */
const DEMO_REPLY_EVIDENCE: Omit<Evidence, 'chunkId'> = {
  documentTitle: '2024 방사선산업 실태조사 보고서',
  categoryName: '실태조사 통계표',
  sectionName: '요약',
  pageNo: 5,
  blockType: 'text',
  chunkContent:
    '본 조사는 방사선 및 방사성동위원소를 이용하는 국내 기관 전수를 대상으로 하며, 이용 분야·인력·매출 규모를 연 1회 집계한다.',
  caption: '출처: 2024 방사선산업 실태조사 (한국방사선진흥협회)',
}

/**
 * 질문에 대한 데모 응답을 만든다 — 항상 INTERNAL 형태.
 * 실연동 시 이 함수가 하던 일을 API-001 호출이 대신한다.
 */
export function makeDemoReply(question: string): ChatMessage {
  const id = `demo-${Date.now()}`
  return {
    id,
    question,
    evidenceType: 'INTERNAL',
    composition: '요약',
    /* 기획 §7 이 요구하는 형태(제목·목록·표·인용)를 한 답변에 모아 화면에서 확인한다 */
    answer: [
      '질문하신 내용에 대해 협회 보유 자료를 검색한 결과입니다. (데모 응답 — 실제 검색이 아닙니다)',
      '',
      '## 요약',
      '실태조사 통계표와 전문보고서에서 관련 근거를 찾았습니다. 구체 수치는 **근거 원문**에서 확인할 수 있습니다.',
      '',
      '### 확인된 내용',
      '- 이용기관 수는 최근 3년간 완만하게 늘고 있습니다.',
      '- 증가분의 대부분은 산업체와 의료기관에서 나옵니다.',
      '- 연구기관과 교육기관은 거의 변동이 없습니다.',
      '',
      '| 구분 | 2022 | 2023 | 2024 |',
      '| --- | --- | --- | --- |',
      '| 산업체 | 5,102 | 5,261 | 5,410 |',
      '| 의료기관 | 2,004 | 2,095 | 2,180 |',
      '| 합계 | 8,602 | 8,874 | 9,132 |',
      '',
      '> 단위: 개소 · 출처: 2024 방사선산업 실태조사 (한국방사선진흥협회)',
    ].join('\n'),
    evidences: [{ ...DEMO_REPLY_EVIDENCE, chunkId: `${id}-e1` }],
    // 후속 추천 질문 (기획 §5.4). 실연동에서는 API 가 돌려주는 값이다
    followUps: ['같은 내용을 연도별 표로 정리해 주세요.', '근거 문서의 조사 기준을 알려주세요.'],
  }
}

/**
 * API-022 목업 — 대화 목록. 최근순.
 * ★ title 이 null 인 건을 하나 섞어 폴백 표기를 확인할 수 있게 한다 (AC-042).
 */
export const DEMO_CONVERSATIONS: ConversationSummary[] = [
  { conversationId: 'v1', title: '2024년 이용기관 수 변화', lastConversedAt: '2026-09-01T17:20:00+09:00' },
  { conversationId: 'v2', title: '비파괴검사 분야 종사자 현황', lastConversedAt: '2026-09-01T10:05:00+09:00' },
  { conversationId: 'v3', title: null, lastConversedAt: '2026-08-31T16:40:00+09:00' },
  { conversationId: 'v4', title: '방사선 이용기관 지역별 분포', lastConversedAt: '2026-08-28T09:12:00+09:00' },
  { conversationId: 'v5', title: '의료기관 방사선 장비 보유 추이', lastConversedAt: '2026-08-14T14:30:00+09:00' },
]
