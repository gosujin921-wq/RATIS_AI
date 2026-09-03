/**
 * ★ 데모 전용 목업 데이터 — 실연동 시 src/demo/ 폴더째 삭제한다.
 *
 * 형태는 src/api/types.ts (API 계약 타입)를 그대로 따른다. 화면은 이 데이터가
 * 목업인지 실응답인지 모른다 — 그래서 API 클라이언트로 갈아끼워도 화면은 그대로다.
 */

import type { Category, ChatMessage, ConversationSummary, Evidence, Me } from '../../api/types'

/**
 * API-031 목업 — 관리자.
 *
 * ★ **관리자로 두는 까닭**: 사용자 메뉴의 「관리자 페이지」는 `role: 'ADMIN'` 일 때만 선다
 *   (요구사항 §5.1 — 일반회원·협회회원에게는 항목 자체를 감춘다). 데모 앱에서 챗봇과
 *   관리자 콘솔을 오가며 보려면 이 값이 관리자여야 한다.
 *   일반 이용자 화면으로 보려면 'ASSOC'(협회회원) · 'GENERAL'(일반회원) 로 바꾼다 —
 *   그때는 사이드바 표기도 함께 바뀌고 관리자 항목은 사라진다.
 */
export const DEMO_ME: Me = {
  displayName: '김방사',
  role: 'ADMIN',
}

/** API-017 목업 */
/**
 * API-017 — 검색 범위 카테고리.
 *
 * ★ **협회가 실제로 보유한 자료 묶음 그대로다** (docs/file_sample 실측 2026-09-03).
 *   종전에는 「실태조사 통계표 · 전문보고서」처럼 지어낸 이름이었는데, 실제 서고는
 *   보고서 종류로 나뉘어 있어 사용자가 고를 이름과 달랐다.
 */
export const DEMO_CATEGORIES: Category[] = [
  { categoryId: 'survey', categoryName: '이용실태조사 보고서' },
  { categoryId: 'issue', categoryName: '이슈페이퍼' },
  { categoryId: 'market', categoryName: '시장분석보고서' },
  { categoryId: 'review', categoryName: '학회리뷰보고서' },
  { categoryId: 'law', categoryName: '법령분석보고서' },
  { categoryId: 'biz', categoryName: '기술사업화 자료' },
]

/* ─────────────────────────────────────────────────────────────────────────
   근거 — **실제 문서에서 뽑은 것이다.**

   문서명·파일명·쪽번호·인용문이 전부 docs/file_sample 의 실물과 같다. 쪽번호는 PDF 의
   물리 쪽이 아니라 **인쇄된 쪽수**다 (사용자가 원문에서 보는 번호).
   수치를 지어내지 않는다 — 화면을 시연하려고 만든 숫자가 실제 보고서의 값인 것처럼
   보이면, 그 화면을 근거로 이야기가 오간다.
   ★ 2022·2023년도 실태조사 보고서는 스캔본이라 본문 글자가 없다. 그래서 인용은 글자층이
     있는 2021년도 보고서에서 가져왔다.
   ───────────────────────────────────────────────────────────────────────── */

const SURVEY_2021 = {
  documentTitle: '2021년도 방사선 및 방사성동위원소 이용실태조사 보고서',
  fileName: '2021년도 방사선 및 방사성동위원소 이용실태조사 보고서.pdf',
  fileUrl: '/files/survey/2021년도 방사선 및 방사성동위원소 이용실태조사 보고서.pdf',
  categoryName: '이용실태조사 보고서',
  pageCount: 410,
} as const

/** 최근 5년 이용기관 수 — 보고서 「총평」의 주요 지표 표 */
const EV_ORG_TABLE: Evidence = {
  ...SURVEY_2021,
  chunkId: 'ev-org-table',
  tableTitle: '주요 지표 — 이용기관 수',
  pageNo: 13,
  blockType: 'table',
  chunkContent:
    '<table><thead><tr><th>구분</th><th>2017</th><th>2018</th><th>2019</th><th>2020</th><th>2021</th></tr></thead><tbody><tr><td>사업소 수</td><td>46,634</td><td>48,182</td><td>49,391</td><td>51,100</td><td>52,814</td></tr><tr><td>산업분야</td><td>5,862</td><td>6,372</td><td>6,696</td><td>6,885</td><td>7,262</td></tr><tr><td>의료분야</td><td>36,258</td><td>37,038</td><td>38,061</td><td>39,098</td><td>40,054</td></tr><tr><td>동물병원</td><td>2,623</td><td>2,948</td><td>2,782</td><td>3,037</td><td>3,384</td></tr><tr><td>교육연구·공공</td><td>1,526</td><td>1,548</td><td>1,618</td><td>1,651</td><td>1,682</td></tr></tbody></table>',
  caption: '단위: 개소 · 출처: 2021년도 방사선 및 방사성동위원소 이용실태조사 보고서 13쪽',
}

/** 이용기관 수 해설 — 본문 */
const EV_ORG_TREND: Evidence = {
  ...SURVEY_2021,
  chunkId: 'ev-org-trend',
  sectionName: '제2장 제1절 총평 · 2. 방사선 이용기관 및 인력 현황',
  pageNo: 14,
  blockType: 'text',
  chunkContent:
    '2021년말 기준으로 방사선 관련 총 이용기관 수는 52,814개 기관으로 최근 5년간 연평균 3.2% 증가하였다. 이 중 비파괴검사, 원자력발전소를 포함한 산업분야 이용기관 수가 7,262개 기관으로 연평균 5.5% 증가하였으며, 반려동물의 증가로 동물진단용 방사선발생장치를 사용하는 동물병원의 수가 총 3,384개로 연평균 6.6% 증가하였다.',
  caption: '출처: 2021년도 방사선 및 방사성동위원소 이용실태조사 보고서 14쪽',
}

/** 종사자 수 — 총평 표 */
const EV_WORKER_TABLE: Evidence = {
  ...SURVEY_2021,
  chunkId: 'ev-worker-table',
  tableTitle: '주요 지표 — 종사자 수',
  pageNo: 13,
  blockType: 'table',
  chunkContent:
    '<table><thead><tr><th>구분</th><th>2017</th><th>2019</th><th>2021</th></tr></thead><tbody><tr><td>종사자 수</td><td>131,417</td><td>146,195</td><td>158,133</td></tr><tr><td>의료분야</td><td>89,996</td><td>100,627</td><td>108,691</td></tr><tr><td>산업분야</td><td>28,998</td><td>31,202</td><td>32,936</td></tr><tr><td>동물병원</td><td>3,677</td><td>5,733</td><td>6,587</td></tr><tr><td>교육연구·공공</td><td>8,746</td><td>8,633</td><td>9,919</td></tr></tbody></table>',
  caption: '단위: 명 · 출처: 2021년도 방사선 및 방사성동위원소 이용실태조사 보고서 13쪽',
}

/** 종사자 수 해설 — 본문 */
const EV_WORKER_TREND: Evidence = {
  ...SURVEY_2021,
  chunkId: 'ev-worker-trend',
  sectionName: '제2장 제1절 총평 · 2. 방사선 이용기관 및 인력 현황',
  pageNo: 15,
  blockType: 'text',
  chunkContent:
    '2021년말 기준으로 방사선 관련 총 종사자 수는 158,133명으로 최근 5년간 연평균 4.7% 증가하였다. 이 중 동물병원에서 종사하는 수의사, 수의간호사, 업무보조원, 기타 인력이 총 6,587명으로 연평균 15.7%로 가장 높게 증가하였으며, 다음으로 의료분야에서 종사하는 방사선작업종사자와 방사선관계종사자가 총 108,691명으로 연평균 4.8% 증가하였다.',
  caption: '출처: 2021년도 방사선 및 방사성동위원소 이용실태조사 보고서 15쪽',
}

/** 수입·생산·수출 — 총평 표 */
const EV_TRADE_TABLE: Evidence = {
  ...SURVEY_2021,
  chunkId: 'ev-trade-table',
  tableTitle: '주요 지표 — 유통(수입·생산·수출) 규모',
  pageNo: 13,
  blockType: 'table',
  chunkContent:
    '<table><thead><tr><th>구분</th><th>2019</th><th>2020</th><th>2021</th></tr></thead><tbody><tr><td>합계</td><td>19,719</td><td>20,889</td><td>27,143</td></tr><tr><td>수입</td><td>6,617</td><td>7,698</td><td>11,928</td></tr><tr><td>생산</td><td>7,797</td><td>7,602</td><td>8,064</td></tr><tr><td>수출</td><td>5,305</td><td>5,589</td><td>7,151</td></tr></tbody></table>',
  caption: '단위: 억 원 · 출처: 2021년도 방사선 및 방사성동위원소 이용실태조사 보고서 13쪽',
}

/** 방사성의약품 신약 — 2025 이슈페이퍼 요약문 */
const EV_RI_DRUG: Evidence = {
  chunkId: 'ev-ri-drug',
  documentTitle: '[2025 이슈페이퍼] 방사성의약품 신약 개발 현황과 전망',
  fileName: '[2025 이슈페이퍼] 방사성의약품 신약 개발 현황과 전망.pdf',
  fileUrl: '/files/issue/[2025 이슈페이퍼] 방사성의약품 신약 개발 현황과 전망.pdf',
  categoryName: '이슈페이퍼',
  pageCount: 13,
  sectionName: '01 요약문',
  pageNo: 3,
  blockType: 'text',
  chunkContent:
    '현재 400개 이상의 베타방출체 및 알파방출체 기반 신약이 임상 진행 중이며 ’30년 이후 환자에게 공급될 것으로 예상됨. 국내의 경우, 전문기업 투자 증가, 일반의약품 대기업의 방사성의약품 산업 진입 등으로 방사성의약품 신약개발 투자가 지속 확대 중임에 따라 글로벌 시장에서 경쟁을 위한 범국가적 전략의 수립이 필요함.',
  caption: '출처: 2025 KARA 이슈페이퍼 「방사성의약품 신약 개발 현황과 전망」 3쪽',
}

/** AI 의료영상 시장 — 2025 시장분석보고서 개요 */
const EV_AI_MARKET: Evidence = {
  chunkId: 'ev-ai-market',
  documentTitle: '[2025 KARA RT REPORT] AI 기반 의료영상 분야 시장분석보고서',
  fileName: '[2025 KARA RT REPORT] AI 기반 의료영상 분야 시장분석보고서.pdf',
  fileUrl: '/files/market/[2025 KARA RT REPORT] AI 기반 의료영상 분야 시장분석보고서.pdf',
  categoryName: '시장분석보고서',
  pageCount: 22,
  sectionName: '01 개요',
  pageNo: 1,
  blockType: 'text',
  chunkContent:
    '의료영상 분야의 AI 활용 시장은 2024년 15억 9,630만 달러에서 약 23.2%의 연평균 성장률을 보이며 2029년 45억 3,800만 달러로 증가할 것으로 예상됨.',
  caption: '출처: 2025 KARA RT REPORT 「AI 기반 의료영상 분야 시장분석보고서」 1쪽',
}

/** 안전규제 — 법령분석보고서 각론 5 개요 */
const EV_SAFETY_LAW: Evidence = {
  chunkId: 'ev-safety-law',
  documentTitle: '각론 5. 방사선 이용기관 안전규제 국내외 비교',
  fileName: '각론 5. 방사선 이용기관 안전규제 국내외 비교.pdf',
  fileUrl: '/files/law/각론 5. 방사선 이용기관 안전규제 국내외 비교.pdf',
  categoryName: '법령분석보고서',
  pageCount: 18,
  sectionName: '1. 개요',
  pageNo: 3,
  blockType: 'text',
  chunkContent:
    '우리나라에서의 방사성동위원소 및 방사선발생장치의 이용은 1962년 사용허가 제도를 시행한 이후 매년 지속적으로 증가하고 있으며, 그 이용기관의 수가 2017년 말 기준으로 총 7,900여개에 달하고 있다. 이와 함께 2003년부터 본격적으로 시행되어온 방사선기기에 대한 설계승인도 약 2,000건에 달하고 있다.',
  caption: '출처: 법령분석보고서 각론 5 「방사선 이용기관 안전규제 국내외 비교」 3쪽',
}

/** v1 — 표 근거 + 본문 근거. 화면의 기본형이다 */
export const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'v1-m1',
    question: '최근 5년간 방사선 이용기관 수는 어떻게 변했나요?',
    evidenceType: 'INTERNAL',
    composition: '요약',
    answer:
      '2021년말 기준 방사선 관련 총 이용기관은 52,814개소로, 최근 5년간 연평균 3.2% 증가했습니다.\n\n분야별로는 의료분야가 40,054개소로 가장 많고 산업분야 7,262개소, 동물병원 3,384개소 순입니다. 증가율은 동물병원이 연평균 6.6%로 가장 높고, 산업분야가 5.5%로 뒤를 잇습니다.\n\n> 협회가 보유한 실태조사 보고서 가운데 본문 수치를 확인할 수 있는 가장 최근 자료는 2021년도 보고서입니다.',
    evidences: [EV_ORG_TABLE, EV_ORG_TREND],
  },
]

/**
 * 대화별 스레드. 사이드바에서 고른 대화가 여기서 나온다.
 * 여기 없는 대화는 빈 화면(시작 화면)으로 떨어진다.
 *
 *   v1  표 근거 · 요약        INTERNAL · 표 + 본문 근거 2건
 *   v2  긴 답변               INTERNAL · 문단이 여럿이라 스크롤이 생긴다
 *   v3  짧은 답               INTERNAL · 근거 1건
 *   v4  비교 구성             composition '비교'
 *   v5  여러 턴               질문·답변 3턴 — 스크롤과 턴 사이 간격
 *   v6  제목 없는 대화         제목 폴백 표기 (AC-042)
 *   v7  외부 응답             EXTERNAL · 고지 줄
 *   v8  범위를 좁혀 못 찾음    scopeNarrowed · 범위를 넓혀 재시도 안내 (AC-034)
 *   v9  차단                  BLOCKED · answer null (AC-026)
 *   v10 정리 구성             composition '정리'
 *   v11 보고서 링크            report — 답변을 정리해 받는 자리
 *   v12 근거 여러 건           근거 3건 — 목록이 접히는 자리
 */
export const DEMO_THREADS: Record<string, ChatMessage[]> = {
  v1: DEMO_MESSAGES,

  /* v2 — 긴 답변. 문단이 여럿이라 스크롤과 「맨 아래로」 단추가 산다 */
  v2: [
    {
      id: 'v2-m1',
      question: '방사선 분야 종사자 수는 최근 어떻게 변했나요?',
      evidenceType: 'INTERNAL',
      composition: '요약',
      answer:
        '2021년말 기준 방사선 관련 총 종사자는 158,133명으로, 최근 5년간 연평균 4.7% 증가했습니다.\n\n분야별로 보면 의료분야 종사자가 108,691명으로 전체의 약 69%를 차지합니다. 방사선작업종사자와 방사선관계종사자를 합한 수치이며, 연평균 4.8% 늘었습니다.\n\n증가율이 가장 높은 곳은 동물병원입니다. 6,587명으로 연평균 15.7% 증가했는데, 반려동물 진료 수요가 늘면서 동물진단용 방사선발생장치를 쓰는 병원이 함께 늘어난 결과입니다.\n\n산업분야는 32,936명으로 연평균 3.2%, 교육연구·공공 분야는 9,919명입니다.',
      evidences: [EV_WORKER_TABLE, EV_WORKER_TREND],
    },
  ],

  /* v3 — 짧은 답. 가장 단출한 형태 */
  v3: [
    {
      id: 'v3-m1',
      question: '실태조사 보고서는 몇 년치가 있나요?',
      evidenceType: 'INTERNAL',
      answer:
        '2002년도부터 2023년도까지의 보고서를 보유하고 있습니다. 2022년도와 2023년도는 본문과 부록이 따로 있습니다.',
      evidences: [EV_ORG_TABLE],
    },
  ],

  /* v4 — 비교 구성 */
  v4: [
    {
      id: 'v4-m1',
      question: '의료분야와 산업분야의 이용 규모를 비교해 주세요.',
      evidenceType: 'INTERNAL',
      composition: '비교',
      answer:
        '## 기관 수\n\n- 의료분야 40,054개소 · 산업분야 7,262개소 (2021년)\n- 기관 수로는 의료분야가 5.5배 많습니다.\n\n## 종사자 수\n\n- 의료분야 108,691명 · 산업분야 32,936명\n- 기관당 종사자는 산업분야가 더 많습니다.\n\n## 증가율\n\n- 기관 수 연평균 증가율은 산업분야 5.5%, 의료분야 2.5%로 산업분야가 높습니다.',
      evidences: [EV_ORG_TABLE, EV_WORKER_TABLE],
    },
  ],

  /* v5 — 여러 턴. 스크롤과 턴 사이 간격을 본다 */
  v5: [
    {
      id: 'v5-m1',
      question: '방사성동위원소 수입 규모는 얼마인가요?',
      evidenceType: 'INTERNAL',
      answer:
        '2021년 국내 수입 규모는 11,928억 원으로 조사되었습니다. 최근 5년간 연평균 5.0% 증가하는 추세입니다.',
      evidences: [EV_TRADE_TABLE],
    },
    {
      id: 'v5-m2',
      question: '생산과 수출은요?',
      evidenceType: 'INTERNAL',
      answer:
        '2021년 국내 총 생산 규모는 8,064억 원, 수출은 7,151억 원입니다. 수입·생산·수출을 합한 유통 규모는 27,143억 원입니다.',
      evidences: [EV_TRADE_TABLE],
    },
    {
      id: 'v5-m3',
      question: '코로나 시기에 수입이 줄었다고 하던데 맞나요?',
      evidenceType: 'INTERNAL',
      answer:
        '보고서는 COVID-19의 영향으로 2년간 수입 규모가 줄었다가 2021년에 다시 이전 수준 이상으로 증가했다고 적고 있습니다. 2019년 6,617억 원에서 2021년 11,928억 원으로 회복했습니다.',
      evidences: [EV_TRADE_TABLE],
    },
  ],

  /* v6 — 제목 없는 대화 (AC-042 폴백 표기) */
  v6: [
    {
      id: 'v6-m1',
      question: 'AI 의료영상 시장은 얼마나 커지나요?',
      evidenceType: 'INTERNAL',
      answer:
        '2024년 15억 9,630만 달러에서 2029년 45억 3,800만 달러로, 연평균 약 23.2% 성장할 것으로 전망됩니다.',
      evidences: [EV_AI_MARKET],
    },
  ],

  /* v7 — 외부 응답. 협회 자료에 근거가 없을 때 (AC-085) */
  v7: [
    {
      id: 'v7-m1',
      question: '방사선 분야 종사자의 평균 연봉은 얼마인가요?',
      evidenceType: 'EXTERNAL',
      notice:
        '협회 보유 자료에서 근거를 찾지 못해 외부 생성형 AI의 일반 지식으로 답변합니다. 협회 문서에 근거한 답변이 아닙니다.',
      answer:
        '협회가 보유한 실태조사·이슈페이퍼·시장분석보고서에는 종사자 임금 통계가 포함되어 있지 않습니다. 임금 정보는 고용노동부 고용형태별 근로실태조사 등 별도 통계를 확인해야 합니다.',
      evidences: [],
    },
  ],

  /* v8 — 범위를 좁혀 못 찾음 (AC-034) */
  v8: [
    {
      id: 'v8-m1',
      question: '학회리뷰보고서에 나온 이용기관 수를 알려주세요.',
      evidenceType: 'INTERNAL',
      scopeNarrowed: true,
      answer: '선택하신 범위에서는 관련 근거를 찾지 못했습니다.',
      evidences: [],
    },
  ],

  /* v9 — 차단 (AC-026) */
  v9: [
    {
      id: 'v9-m1',
      question: '(안전 정책에 걸리는 질문)',
      evidenceType: 'BLOCKED',
      notice: '요청하신 내용은 답변할 수 없습니다. 다른 표현으로 다시 물어봐 주세요.',
      answer: null,
      evidences: [],
    },
  ],

  /* v10 — 정리 구성 */
  v10: [
    {
      id: 'v10-m1',
      question: '방사선 이용기관 안전규제는 어떻게 바뀌어 왔나요?',
      evidenceType: 'INTERNAL',
      composition: '정리',
      answer:
        '- 1962년 사용허가 제도 시행 이후 이용기관 수가 매년 증가해 왔습니다.\n- 2003년부터 방사선기기 설계승인 제도가 본격 시행되어 공급자의 안전성 입증 의무가 강화되었습니다.\n- 2000년대 이후에는 사이클로트론·가속기 도입 증가로 이용시설이 대형화되었습니다.\n- 원자력안전법을 통한 안전규제는 법률체계와 규제기관에 큰 변화가 있었습니다.',
      evidences: [EV_SAFETY_LAW],
    },
  ],

  /* v11 — 보고서 링크. 답변을 정리해 받는 자리 (제공 방식은 미확정) */
  v11: [
    {
      id: 'v11-m1',
      question: '방사성의약품 신약 개발 동향을 정리해 주세요.',
      evidenceType: 'INTERNAL',
      answer:
        '현재 400개 이상의 베타방출체·알파방출체 기반 신약이 임상 진행 중이며, 2030년 이후 환자 공급이 예상됩니다.\n\n국내에서도 전문기업 투자와 일반의약품 대기업의 시장 진입으로 개발 투자가 확대되고 있어, 글로벌 경쟁을 위한 범국가적 전략 수립이 필요하다는 것이 보고서의 진단입니다.',
      evidences: [EV_RI_DRUG],
      report: {
        title: '방사성의약품 신약 개발 동향 정리',
        url: '/reports/ri-drug-2025',
      },
    },
  ],

  /* v12 — 근거 여러 건. 목록이 접히는 자리 */
  v12: [
    {
      id: 'v12-m1',
      question: '협회 자료로 방사선 산업 전반을 한 번에 훑어 주세요.',
      evidenceType: 'INTERNAL',
      composition: '정리',
      answer:
        '## 규모\n\n2021년 기준 이용기관 52,814개소, 종사자 158,133명, 유통 규모 27,143억 원입니다.\n\n## 성장 분야\n\n동물병원(연평균 15.7%)과 산업분야(5.5%)의 증가가 두드러집니다.\n\n## 기술·시장\n\n방사성의약품 신약은 400개 이상이 임상 중이고, AI 의료영상 시장은 2029년까지 연평균 23.2% 성장이 전망됩니다.',
      evidences: [EV_ORG_TABLE, EV_WORKER_TABLE, EV_RI_DRUG, EV_AI_MARKET],
    },
  ],
}

/** 데모에서 새로 물었을 때 붙는 근거 */
const DEMO_REPLY_EVIDENCE: Omit<Evidence, 'chunkId'> = {
  ...SURVEY_2021,
  tableTitle: '주요 지표 — 이용기관 수',
  pageNo: 13,
  blockType: 'table',
  chunkContent: EV_ORG_TABLE.chunkContent,
  caption: EV_ORG_TABLE.caption,
}

/**
 * 새 질문에 붙는 데모 응답. 실연동에서는 API-001 이 이 자리를 진다.
 * ★ 무엇을 묻든 같은 근거가 붙는다 — 화면 흐름을 보기 위한 자리이지 답을 내는 자리가 아니다.
 */
export function makeDemoReply(question: string): ChatMessage {
  const id = `r-${Date.now()}`
  return {
    id,
    question,
    evidenceType: 'INTERNAL',
    composition: '요약',
    answer: [
      '2021년말 기준 방사선 관련 총 이용기관은 **52,814개소**로, 최근 5년간 연평균 3.2% 증가했습니다.',
      '',
      '- 의료분야가 40,054개소로 가장 많습니다.',
      '- 산업분야는 7,262개소로 연평균 5.5% 증가했습니다.',
      '- 동물병원은 3,384개소로 증가율(6.6%)이 가장 높습니다.',
      '',
      '| 구분 | 2019 | 2020 | 2021 |',
      '| --- | --- | --- | --- |',
      '| 사업소 수 | 49,391 | 51,100 | 52,814 |',
      '| 의료분야 | 38,061 | 39,098 | 40,054 |',
      '| 산업분야 | 6,696 | 6,885 | 7,262 |',
      '',
      '> 단위: 개소 · 출처: 2021년도 방사선 및 방사성동위원소 이용실태조사 보고서 13쪽',
    ].join('\n'),
    evidences: [{ ...DEMO_REPLY_EVIDENCE, chunkId: `${id}-e1` }],
  }
}

/**
 * 「며칠 전 몇 시」를 ISO 로 만든다.
 *
 * ★ 날짜를 **박아 두지 않는다.** 목록은 오늘을 기준으로 「오늘·어제·지난 7일…」로 묶이는데,
 *   고정 날짜를 쓰면 하루만 지나도 「오늘」 묶음이 비어 화면이 실제와 다르게 잡힌다
 *   (2026-09-02 확인 — 맨 위 두 건이 어제로 내려가 오늘 묶음이 사라져 있었다).
 *   상대 날짜로 두면 언제 열어도 묶음이 그대로 선다.
 */
function daysAgo(days: number, time = '14:00') {
  const [h, m] = time.split(':').map(Number)
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(h, m, 0, 0)
  /* 서버 시각대는 Asia/Seoul 고정이다 — 오프셋을 직접 붙여 브라우저 시각대에 안 흔들리게 한다 */
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(h)}:${p(m)}:00+09:00`
}

/**
 * API-022 목업 — 대화 목록.
 *
 * ★ **묶음마다 두 건 이상** 둔다. 화면을 캡처하거나 시연할 때 「고정됨·오늘·지난 대화」가
 *   한 화면에 다 서야 목록이 어떻게 갈리는지 보인다. 묶음이 하나씩만 있으면 제목 줄과
 *   대화 줄이 번갈아 나와 무엇이 묶음 이름인지 읽히지 않는다.
 * ★ 고정은 **오래된 것과 최근 것을 같이** 둔다. 시각과 무관하게 맨 위에 남는다는 규칙이
 *   한눈에 보인다.
 * ★ 고정과 나머지 **둘 다 보기 개수를 넘게** 둔다 (고정 5건 · 나머지 8건) —
 *   묶음마다 서는 「더 보기」를 둘 다 확인할 수 있어야 한다.
 * ★ title 이 null 인 건을 하나 섞어 폴백 표기를 확인할 수 있게 한다 (AC-042).
 */
export const DEMO_CONVERSATIONS: ConversationSummary[] = [
  /* 고정됨 — 시각과 무관하게 맨 위 묶음. 상한(5건)을 넘겨 「더 보기」가 서게 둔다 */
  { conversationId: 'v1', title: '최근 5년 이용기관 수 추이', lastConversedAt: daysAgo(0, '11:20'), pinned: true },
  { conversationId: 'v2', title: '방사선 분야 종사자 수 변화', lastConversedAt: daysAgo(41, '15:05'), pinned: true },
  { conversationId: 'v10', title: '이용기관 안전규제 변천', lastConversedAt: daysAgo(2, '09:30'), pinned: true },
  { conversationId: 'v5', title: '방사성동위원소 수입·생산·수출', lastConversedAt: daysAgo(9, '17:05'), pinned: true },
  { conversationId: 'v11', title: '방사성의약품 신약 개발 동향', lastConversedAt: daysAgo(20, '11:15'), pinned: true },
  { conversationId: 'v12', title: '방사선 산업 전반 훑어보기', lastConversedAt: daysAgo(33, '14:45'), pinned: true },
  { conversationId: 'v4', title: '의료분야·산업분야 비교', lastConversedAt: daysAgo(64, '10:10'), pinned: true },

  /* 오늘 */
  { conversationId: 'v3', title: '실태조사 보고서 보유 연도', lastConversedAt: daysAgo(0, '17:20') },
  { conversationId: 'v6', title: null, lastConversedAt: daysAgo(0, '10:05') },

  /* 지난 대화 */
  { conversationId: 'v7', title: '종사자 평균 연봉 문의', lastConversedAt: daysAgo(1, '16:40') },
  { conversationId: 'v8', title: '학회리뷰보고서 범위 검색', lastConversedAt: daysAgo(1, '09:15') },
  { conversationId: 'v9', title: '답변할 수 없는 질문', lastConversedAt: daysAgo(3, '14:30') },
  { conversationId: 'c1', title: 'AI 의료영상 시장 전망', lastConversedAt: daysAgo(5, '11:48') },
  { conversationId: 'c2', title: '선형가속기 시장분석 요약', lastConversedAt: daysAgo(12, '13:02') },
  { conversationId: 'c3', title: '방사선 멸균 시장 규모', lastConversedAt: daysAgo(24, '10:26') },
  { conversationId: 'c4', title: 'SMR 개발 동향 정리', lastConversedAt: daysAgo(58, '16:10') },
  { conversationId: 'c5', title: '방사선기기 설계승인 건수', lastConversedAt: daysAgo(112, '09:40') },
]
