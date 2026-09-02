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
/**
 * ★ 대화 하나에 **상태 하나.**
 *
 * 종전에는 한 대화(v1) 안에 「표 근거 답변 · 외부 응답 · 차단」이 한꺼번에 들어 있고
 * 나머지 대화는 전부 빈 화면이었다. 그러면 화면을 상태별로 찍을 수가 없다 — 한 장에
 * 세 상태가 겹쳐 나오고, 다른 대화를 눌러도 볼 것이 없다.
 * 지금은 사이드바에서 대화를 하나씩 눌러 내려가면 상태가 하나씩 나온다.
 *
 *   v1  표 근거 · 요약        INTERNAL · 표 블록 + 본문 근거 2건
 *   v2  긴 답변               INTERNAL · 문단이 여럿이라 스크롤이 생긴다
 *   v3  근거 없이 짧은 답      INTERNAL · 근거 1건 · 후속 질문 없음
 *   v4  비교 구성             composition '비교'
 *   v5  여러 턴               질문·답변 3턴 — 스크롤과 턴 사이 간격
 *   v6  제목 없는 대화         제목 폴백 표기 (AC-042)
 *   v7  외부 응답             EXTERNAL · 고지 줄
 *   v8  범위를 좁혀 못 찾음    scopeNarrowed · 범위를 넓혀 재시도 안내 (AC-034)
 *   v9  차단                  BLOCKED · answer null (AC-026)
 *   v10 정리 구성             composition '정리'
 *   v11 표만 있는 근거         근거가 표 하나뿐인 답변
 *   v12 근거 여러 건           근거 3건 — 목록이 접히는 자리
 */

/*
 * 근거 — **질문마다 다른 것을 붙인다.**
 * 몇 개를 돌려 쓰면 매출을 물었는데 기관 수 표가 붙는 식으로 어긋나고, 화면을 상태별로
 * 찍어도 근거 카드가 다 같아 보인다. chunkId 는 카드의 React key 라 한 답변 안에서
 * 겹치면 안 된다 (다른 답변에 같은 근거가 또 나오는 건 정상이다 — 같은 자료를 두 번
 * 인용한 것이고, 화면엔 인용 번호 체계가 없어 라벨도 그대로다).
 */

/** 연도별 이용기관 현황 — 표 */
const EV_ORG_TABLE: Evidence = {
  chunkId: 'ev-org-table',
  documentTitle: '2024 방사선산업 실태조사 보고서',
  categoryName: '실태조사 통계표',
  tableTitle: '연도별 방사선 이용기관 현황',
  pageNo: 47,
  blockType: 'table',
  chunkContent:
    '<table><thead><tr><th>구분</th><th>2022</th><th>2023</th><th>2024</th></tr></thead><tbody><tr><td>산업체</td><td>5,102</td><td>5,261</td><td>5,410</td></tr><tr><td>의료기관</td><td>2,004</td><td>2,095</td><td>2,180</td></tr><tr><td>연구기관</td><td>801</td><td>815</td><td>830</td></tr><tr><td>교육기관</td><td>695</td><td>703</td><td>712</td></tr><tr><td>합계</td><td>8,602</td><td>8,874</td><td>9,132</td></tr></tbody></table>',
  caption: '단위: 개소 · 출처: 2024 방사선산업 실태조사 (한국방사선진흥협회)',
}

/** 기관 수 추이 해설 — 본문 */
const EV_ORG_TREND: Evidence = {
  chunkId: 'ev-org-trend',
  documentTitle: '방사선 이용통계 연차분석',
  categoryName: '전문보고서',
  sectionName: '3.2 기관 수 추이',
  pageNo: 12,
  blockType: 'text',
  chunkContent:
    '최근 3년간 방사선 이용기관 수는 연평균 3% 내외의 완만한 증가세를 유지하고 있으며, 특히 비파괴검사 분야 산업체의 신규 등록이 증가세를 견인하고 있다.',
  caption: '출처: 방사선 이용통계 연차분석 (한국방사선진흥협회)',
}

/** 분야별 종사자 수 — 표 */
const EV_WORKER_TABLE: Evidence = {
  chunkId: 'ev-worker-table',
  documentTitle: '2024 방사선산업 실태조사 보고서',
  categoryName: '실태조사 통계표',
  tableTitle: '분야별 방사선 종사자 수',
  pageNo: 61,
  blockType: 'table',
  chunkContent:
    '<table><thead><tr><th>구분</th><th>2020</th><th>2022</th><th>2024</th></tr></thead><tbody><tr><td>산업체</td><td>22,410</td><td>24,880</td><td>26,140</td></tr><tr><td>의료기관</td><td>12,760</td><td>13,640</td><td>14,220</td></tr><tr><td>연구기관</td><td>3,780</td><td>4,210</td><td>4,610</td></tr><tr><td>교육기관</td><td>2,386</td><td>2,640</td><td>2,850</td></tr><tr><td>합계</td><td>41,336</td><td>45,370</td><td>47,820</td></tr></tbody></table>',
  caption: '단위: 명 · 출처: 2024 방사선산업 실태조사 (한국방사선진흥협회)',
}

/** 종사자 집계 기준 — 본문 */
const EV_WORKER_RULE: Evidence = {
  chunkId: 'ev-worker-rule',
  documentTitle: '2024 방사선산업 실태조사 보고서',
  categoryName: '실태조사 통계표',
  sectionName: '4.1 종사자 현황',
  pageNo: 63,
  blockType: 'text',
  chunkContent:
    '종사자는 방사선 관련 업무에 상시 종사하는 인력을 말하며, 겸직자는 주 업무 기준으로 1회만 집계한다.',
  caption: '출처: 2024 방사선산업 실태조사 (한국방사선진흥협회)',
}

/** 분야별 장비 보유 — 표 (산업체 · 의료기관 비교용) */
const EV_DEVICE_TABLE: Evidence = {
  chunkId: 'ev-device-table',
  documentTitle: '2024 방사선산업 실태조사 보고서',
  categoryName: '실태조사 통계표',
  tableTitle: '분야별 방사선 장비 보유 현황',
  pageNo: 52,
  blockType: 'table',
  chunkContent:
    '<table><thead><tr><th>구분</th><th>이동형</th><th>고정형</th><th>합계</th></tr></thead><tbody><tr><td>산업체</td><td>7,940</td><td>2,110</td><td>10,050</td></tr><tr><td>의료기관</td><td>860</td><td>6,430</td><td>7,290</td></tr></tbody></table>',
  caption: '단위: 대 · 출처: 2024 방사선산업 실태조사 (한국방사선진흥협회)',
}

/** 지역별 이용기관 분포 — 표 */
const EV_REGION_TABLE: Evidence = {
  chunkId: 'ev-region-table',
  documentTitle: '2024 방사선산업 실태조사 보고서',
  categoryName: '실태조사 통계표',
  tableTitle: '시도별 방사선 이용기관 수',
  pageNo: 49,
  blockType: 'table',
  chunkContent:
    '<table><thead><tr><th>시도</th><th>2023</th><th>2024</th></tr></thead><tbody><tr><td>경기</td><td>2,081</td><td>2,140</td></tr><tr><td>서울</td><td>1,552</td><td>1,580</td></tr><tr><td>경남</td><td>698</td><td>720</td></tr><tr><td>인천</td><td>486</td><td>505</td></tr><tr><td>기타</td><td>4,057</td><td>4,187</td></tr></tbody></table>',
  caption: '단위: 개소 · 출처: 2024 방사선산업 실태조사 (한국방사선진흥협회)',
}

/** 입지 경향 — 본문 */
const EV_REGION_WHY: Evidence = {
  chunkId: 'ev-region-why',
  documentTitle: '방사선 이용통계 연차분석',
  categoryName: '전문보고서',
  sectionName: '4.1 지역 분포',
  pageNo: 18,
  blockType: 'text',
  chunkContent:
    '비파괴검사 업체와 의료기관은 수요처와의 거리에 민감하여 산업단지·대형병원이 밀집한 수도권에 신규 등록이 집중되는 경향을 보인다.',
  caption: '출처: 방사선 이용통계 연차분석 (한국방사선진흥협회)',
}

/** 안전관리자 배치 기준 — 본문 */
const EV_SAFETY: Evidence = {
  chunkId: 'ev-safety',
  documentTitle: '방사선 안전관리 실무 지침',
  categoryName: '전문보고서',
  sectionName: '2.1 안전관리자 배치',
  pageNo: 34,
  blockType: 'text',
  chunkContent:
    '허가사용자는 방사선안전관리자 1명 이상을 선임하여야 하며, 취급 방사성동위원소의 수량과 종류가 기준을 넘는 경우 추가 선임 기준이 적용된다.',
  caption: '출처: 방사선 안전관리 실무 지침 (한국방사선진흥협회)',
}

/** 연구기관 이용 분야 — 표 */
const EV_RESEARCH_TABLE: Evidence = {
  chunkId: 'ev-research-table',
  documentTitle: '2024 방사선산업 실태조사 보고서',
  categoryName: '실태조사 통계표',
  tableTitle: '연구기관 방사선 이용 분야',
  pageNo: 71,
  blockType: 'table',
  chunkContent:
    '<table><thead><tr><th>분야</th><th>기관 수</th><th>비중</th></tr></thead><tbody><tr><td>재료 분석</td><td>312</td><td>37.6%</td></tr><tr><td>생명과학 연구</td><td>214</td><td>25.8%</td></tr><tr><td>계측기 개발</td><td>168</td><td>20.2%</td></tr><tr><td>환경 방사능 측정</td><td>136</td><td>16.4%</td></tr></tbody></table>',
  caption: '단위: 개소 · 출처: 2024 방사선산업 실태조사 (한국방사선진흥협회)',
}

/** 매출액 규모 — 표 */
const EV_SALES_TABLE: Evidence = {
  chunkId: 'ev-sales-table',
  documentTitle: '2024 방사선산업 실태조사 보고서',
  categoryName: '실태조사 통계표',
  tableTitle: '분야별 방사선 관련 매출액',
  pageNo: 88,
  blockType: 'table',
  chunkContent:
    '<table><thead><tr><th>구분</th><th>2023</th><th>2024</th></tr></thead><tbody><tr><td>산업체</td><td>58,140</td><td>61,300</td></tr><tr><td>의료기관</td><td>17,020</td><td>17,940</td></tr><tr><td>연구·교육</td><td>4,890</td><td>4,970</td></tr><tr><td>합계</td><td>80,050</td><td>84,210</td></tr></tbody></table>',
  caption: '단위: 억 원 · 출처: 2024 방사선산업 실태조사 (한국방사선진흥협회)',
}

/** 매출 집계 범위 — 본문 */
const EV_SALES_RULE: Evidence = {
  chunkId: 'ev-sales-rule',
  documentTitle: '방사선산업 매출 분석',
  categoryName: '전문보고서',
  sectionName: '2.3 집계 범위',
  pageNo: 21,
  blockType: 'text',
  chunkContent:
    '매출액은 방사선 관련 사업 부문에서 발생한 금액만 포함하며, 겸업 기업의 비관련 매출은 제외한다.',
  caption: '출처: 방사선산업 매출 분석 (한국방사선진흥협회)',
}

/** 조사 개요 — 본문 */
const EV_SURVEY_SCOPE: Evidence = {
  chunkId: 'ev-survey-scope',
  documentTitle: '2024 방사선산업 실태조사 보고서',
  categoryName: '실태조사 통계표',
  sectionName: '조사 개요',
  pageNo: 5,
  blockType: 'text',
  chunkContent:
    '본 조사는 방사선 및 방사성동위원소를 이용하는 국내 기관 전수를 대상으로 하며, 이용 분야·인력·매출 규모를 연 1회 집계한다.',
  caption: '출처: 2024 방사선산업 실태조사 (한국방사선진흥협회)',
}

/** 표본 설계 — 본문 */
const EV_SURVEY_DESIGN: Evidence = {
  chunkId: 'ev-survey-design',
  documentTitle: '실태조사 조사설계 보고서',
  categoryName: '전문보고서',
  sectionName: '1.2 모집단과 조사 방식',
  pageNo: 8,
  blockType: 'text',
  chunkContent:
    '모집단은 원자력안전위원회 허가·신고 기관 명부로 하며, 표본추출 없이 전수를 조사한다. 미응답 기관은 행정자료로 보완한다.',
  caption: '출처: 실태조사 조사설계 보고서 (한국방사선진흥협회)',
}

/** v1 — 표 근거 · 요약 구성. 화면의 기본형이다 */
export const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'v1-m1',
    question: '2024년 방사선 이용기관 수는 어떻게 변했나요?',
    evidenceType: 'INTERNAL',
    composition: '요약',
    answer:
      '2024년 국내 방사선 이용기관은 총 9,132개소로 전년(8,874개소) 대비 약 2.9% 증가했습니다.\n\n분야별로는 산업체가 5,410개소로 가장 큰 비중을 차지했고, 의료기관 2,180개소, 연구기관 830개소, 교육기관 712개소 순입니다. 산업체와 의료기관의 증가가 전체 증가분의 대부분을 차지합니다.',
    followUps: ['비파괴검사 분야만 따로 볼 수 있나요?', '전년 대비 증감률도 알려주세요.'],
    evidences: [EV_ORG_TABLE, EV_ORG_TREND],
  },
]

/**
 * 대화별 스레드. 사이드바에서 고른 대화가 여기서 나온다.
 * 여기 없는 대화는 빈 화면(시작 화면)으로 떨어진다.
 */
export const DEMO_THREADS: Record<string, ChatMessage[]> = {
  v1: DEMO_MESSAGES,

  /* v2 — 긴 답변. 문단이 여럿이라 스크롤과 「맨 아래로」 단추가 산다 */
  v2: [
    {
      id: 'v2-m1',
      question: '방사선 분야 종사자 수는 최근 5년간 어떻게 변했나요?',
      evidenceType: 'INTERNAL',
      composition: '요약',
      answer:
        '2024년 방사선 분야 종사자는 총 47,820명으로, 2020년(41,336명) 대비 15.7% 증가했습니다.\n\n분야별로 보면 산업체 종사자가 26,140명으로 전체의 54.7%를 차지합니다. 이 가운데 비파괴검사 인력이 9,870명으로 산업체 종사자의 3분의 1을 넘습니다. 의료기관 종사자는 14,220명이며, 진단용 장비 운영 인력의 비중이 계속 커지고 있습니다.\n\n연구기관은 4,610명, 교육기관은 2,850명으로 규모 자체는 크지 않지만, 두 분야 모두 5년간 20% 이상 늘어 증가율은 가장 높습니다. 신규 연구시설 가동과 학과 개설이 배경으로 지목됩니다.\n\n다만 증가폭은 2023년을 지나며 둔화되고 있습니다. 2022년까지 연 4% 안팎이던 증가율이 2024년에는 2.1%로 내려왔습니다.',
      followUps: ['분야별 증가율을 표로 보여주세요.', '비파괴검사 인력만 따로 볼 수 있나요?'],
      evidences: [EV_WORKER_TABLE, EV_WORKER_RULE],
    },
  ],

  /* v3 — 짧은 답 · 후속 질문 없음. 가장 단출한 형태 */
  v3: [
    {
      id: 'v3-m1',
      question: '실태조사는 몇 년에 한 번 하나요?',
      evidenceType: 'INTERNAL',
      answer: '방사선산업 실태조사는 연 1회 실시하며, 조사 기준일은 매년 12월 31일입니다.',
      evidences: [EV_SURVEY_SCOPE],
    },
  ],

  /* v4 — 비교 구성. 배지에 「비교」가 선다 */
  v4: [
    {
      id: 'v4-m1',
      question: '산업체와 의료기관의 방사선 이용을 비교해 주세요.',
      evidenceType: 'INTERNAL',
      composition: '비교',
      answer:
        '기관 수는 산업체가 5,410개소로 의료기관(2,180개소)의 약 2.5배입니다. 반면 종사자 1인당 장비 보유 수는 의료기관이 더 높습니다.\n\n산업체는 비파괴검사를 중심으로 이동형 장비를 많이 쓰고, 의료기관은 진단·치료용 고정형 장비가 대부분입니다. 증가 속도는 두 분야가 비슷하지만, 의료기관 쪽이 장비 교체 주기가 짧습니다.',
      followUps: ['장비 종류별로도 비교해 주세요.'],
      evidences: [EV_DEVICE_TABLE, EV_ORG_TABLE],
    },
  ],

  /* v5 — 여러 턴. 턴 사이 간격과 스크롤을 본다 */
  v5: [
    {
      id: 'v5-m1',
      question: '방사선 이용기관이 가장 많은 지역은 어디인가요?',
      evidenceType: 'INTERNAL',
      composition: '요약',
      answer:
        '경기도가 2,140개소로 가장 많고, 서울 1,580개소, 경남 720개소 순입니다. 수도권(서울·경기·인천)이 전체의 46.3%를 차지합니다.',
      followUps: ['수도권 비중이 커진 이유가 있나요?'],
      evidences: [EV_REGION_TABLE],
    },
    {
      id: 'v5-m2',
      question: '수도권 비중이 커진 이유가 있나요?',
      evidenceType: 'INTERNAL',
      answer:
        '보고서는 비파괴검사 업체와 의료기관이 수요처 가까이 자리 잡는 경향을 원인으로 봅니다. 산업단지와 대형병원이 수도권에 몰려 있어 신규 등록도 그쪽에서 나옵니다.',
      followUps: ['비수도권 증가율은 어떤가요?'],
      evidences: [EV_REGION_WHY],
    },
    {
      id: 'v5-m3',
      question: '비수도권 증가율은 어떤가요?',
      evidenceType: 'INTERNAL',
      answer:
        '비수도권은 2024년 3.4% 늘어 수도권(2.6%)보다 증가율이 높습니다. 다만 기관 수 자체가 적어 절대 증가분은 수도권이 더 큽니다.',
      /* 같은 표를 첫 턴에 이어 다시 인용한다 — 화면에 인용 번호가 없으니 라벨도 그대로다 */
      evidences: [EV_REGION_TABLE],
    },
  ],

  /* v6 — 제목이 아직 안 붙은 대화. 사이드바 폴백 표기를 본다 (AC-042) */
  v6: [
    {
      id: 'v6-m1',
      question: '방사선 안전관리자는 몇 명을 둬야 하나요?',
      evidenceType: 'INTERNAL',
      answer:
        '허가 사용 기관은 최소 1명의 안전관리자를 두어야 하며, 취급 방사성동위원소의 수량과 종류에 따라 추가 배치 기준이 적용됩니다.',
      evidences: [EV_SAFETY],
    },
  ],

  /* v7 — 외부 응답. 내부 근거를 못 찾아 외부 LLM 으로 넘어간 경우 */
  v7: [
    {
      id: 'v7-m1',
      question: '국내 방사선 분야 종사자의 평균 연봉 추이도 알 수 있어?',
      evidenceType: 'EXTERNAL',
      answer:
        '협회 보유 자료에서는 해당 근거를 찾지 못했습니다. 아래는 외부 생성형 AI의 일반 지식에 기반한 응답입니다.\n\n국내 방사선 분야 종사자의 보수 수준은 직군(방사선사, 비파괴검사원, 연구인력 등)에 따라 편차가 크며, 공개 통계로는 고용노동부 직종별 임금 통계 등을 참고할 수 있습니다.',
      notice: '내부 자료에서 근거를 찾지 못해 외부 LLM 응답을 표시합니다. 협회 문서에 근거한 답변이 아닙니다.',
      evidences: [],
    },
  ],

  /* v8 — 범위를 좁혀 못 찾음. 범위를 넓혀 다시 묻는 안내가 뜬다 (AC-034) */
  v8: [
    {
      id: 'v8-m1',
      question: '2024년 방사성동위원소 수입 실적을 알려주세요.',
      evidenceType: 'INTERNAL',
      answer:
        '선택한 검색 범위(전문보고서)에서는 수입 실적 수치를 찾지 못했습니다. 실태조사 통계표를 포함해 다시 찾아보시겠습니까?',
      scopeNarrowed: true,
      evidences: [],
    },
  ],

  /* v9 — 차단. 답변 자리가 비고 사유만 선다 (AC-026) */
  v9: [
    {
      id: 'v9-m1',
      question: '실태조사에 응답한 업체 담당자 연락처를 알려줘',
      evidenceType: 'BLOCKED',
      answer: null,
      notice: '개인정보에 해당하는 내용은 답변할 수 없습니다.',
      evidences: [],
    },
  ],

  /* v10 — 정리 구성 */
  v10: [
    {
      id: 'v10-m1',
      question: '연구기관의 방사선 이용 분야를 정리해 주세요.',
      evidenceType: 'INTERNAL',
      composition: '정리',
      answer:
        '연구기관 830개소의 이용 분야는 크게 넷으로 나뉩니다.\n\n재료 분석이 312개소로 가장 많고, 생명과학 연구 214개소, 방사선 계측기 개발 168개소, 환경 방사능 측정 136개소 순입니다. 재료 분석과 생명과학이 전체의 63%를 차지합니다.',
      followUps: ['분야별 종사자 수도 알려주세요.'],
      evidences: [EV_RESEARCH_TABLE],
    },
  ],

  /* v11 — 근거가 표 하나뿐인 답변 */
  v11: [
    {
      id: 'v11-m1',
      question: '방사선 관련 매출액은 얼마인가요?',
      evidenceType: 'INTERNAL',
      answer:
        '2024년 방사선 관련 매출액은 8조 4,210억 원으로 전년 대비 5.2% 증가했습니다. 산업체 부문이 6조 1,300억 원으로 전체의 72.8%를 차지합니다.',
      evidences: [EV_SALES_TABLE],
    },
  ],

  /* v12 — 근거 여러 건. 근거 목록이 길어지는 자리 */
  v12: [
    {
      id: 'v12-m1',
      question: '실태조사 표본은 어떻게 설계하나요?',
      evidenceType: 'INTERNAL',
      composition: '정리',
      answer:
        '실태조사는 표본조사가 아니라 전수조사입니다. 원자력안전위원회 허가·신고 기관 명부를 모집단으로 삼고, 미응답 기관은 행정자료로 보완합니다.\n\n집계 기준은 기관·인력·매출 세 가지로 나뉘며, 각각 별도의 집계 규칙을 둡니다.',
      followUps: ['미응답 기관 비율은 얼마나 되나요?'],
      evidences: [EV_SURVEY_DESIGN, EV_SURVEY_SCOPE, EV_SALES_RULE],
    },
  ],
}

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
 * ★ **묶음마다 두 건 이상** 둔다. 화면을 캡처하거나 시연할 때 「고정됨·오늘·어제·지난 7일·
 *   지난 30일·이전」이 한 화면에 다 서야 목록이 어떻게 갈리는지 보인다. 묶음이 하나씩만
 *   있으면 제목 줄과 대화 줄이 번갈아 나와 무엇이 묶음 이름인지 읽히지 않는다.
 * ★ 고정은 **오래된 것과 최근 것을 같이** 둔다. 시각과 무관하게 맨 위에 남는다는 규칙이
 *   한눈에 보인다.
 * ★ title 이 null 인 건을 하나 섞어 폴백 표기를 확인할 수 있게 한다 (AC-042).
 */
export const DEMO_CONVERSATIONS: ConversationSummary[] = [
  /* 고정됨 — 시각과 무관하게 맨 위 묶음 */
  { conversationId: 'v1', title: '방사선산업 실태조사 총괄 요약', lastConversedAt: daysAgo(0, '11:20'), pinned: true },
  { conversationId: 'v2', title: '종사자 수 5년 추이', lastConversedAt: daysAgo(41, '15:05'), pinned: true },

  /* 오늘 */
  { conversationId: 'v3', title: '2024년 이용기관 수 변화', lastConversedAt: daysAgo(0, '17:20') },
  { conversationId: 'v4', title: '비파괴검사 분야 종사자 현황', lastConversedAt: daysAgo(0, '10:05') },

  /* 어제 — 제목이 아직 안 붙은 건을 여기 둔다 */
  { conversationId: 'v5', title: '방사선 이용기관 지역별 분포', lastConversedAt: daysAgo(1, '16:40') },
  { conversationId: 'v6', title: null, lastConversedAt: daysAgo(1, '09:15') },

  /* 지난 7일 */
  { conversationId: 'v7', title: '의료기관 방사선 장비 보유 추이', lastConversedAt: daysAgo(3, '14:30') },
  { conversationId: 'v8', title: '방사성동위원소 수입 실적', lastConversedAt: daysAgo(5, '11:48') },

  /* 지난 30일 */
  { conversationId: 'v9', title: '산업체 안전관리자 배치 기준', lastConversedAt: daysAgo(12, '13:02') },
  { conversationId: 'v10', title: '연구기관 방사선 이용 분야별 비중', lastConversedAt: daysAgo(24, '10:26') },

  /* 이전 */
  { conversationId: 'v11', title: '방사선 관련 매출액 규모', lastConversedAt: daysAgo(58, '16:10') },
  { conversationId: 'v12', title: '실태조사 표본 설계 방법', lastConversedAt: daysAgo(112, '09:40') },
]
