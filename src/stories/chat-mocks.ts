import type { ChatMessage, Evidence } from '../api/types'

/**
 * 대화 부품 스토리가 함께 쓰는 목업.
 *
 * ★ **협회가 실제로 보유한 자료다** (docs/file_sample). 문서명·파일명·쪽번호·인용문이
 *   실물과 같다. 수치를 지어내지 않는다 — 시연용으로 만든 숫자가 실제 보고서의 값인 것처럼
 *   보이면 그 화면을 근거로 이야기가 오간다.
 * ★ `src/demo/` 를 부르지 않는다. 그 폴더는 실연동 때 통째로 지우는 자리라, 스토리가
 *   거기 기대면 같이 깨진다.
 */
const SURVEY_2021 = {
  documentTitle: '2021년도 방사선 및 방사성동위원소 이용실태조사 보고서',
  fileName: '2021년도 방사선 및 방사성동위원소 이용실태조사 보고서.pdf',
  fileUrl: '/files/survey/2021년도 방사선 및 방사성동위원소 이용실태조사 보고서.pdf',
  categoryName: '이용실태조사 보고서',
  pageCount: 410,
} as const

export const EV_TABLE: Evidence = {
  ...SURVEY_2021,
  chunkId: 'ev-table',
  tableTitle: '주요 지표 — 이용기관 수',
  pageNo: 13,
  blockType: 'table',
  chunkContent:
    '<table><thead><tr><th>구분</th><th>2019</th><th>2020</th><th>2021</th></tr></thead><tbody><tr><td>사업소 수</td><td>49,391</td><td>51,100</td><td>52,814</td></tr><tr><td>의료분야</td><td>38,061</td><td>39,098</td><td>40,054</td></tr><tr><td>산업분야</td><td>6,696</td><td>6,885</td><td>7,262</td></tr></tbody></table>',
  caption: '단위: 개소 · 출처: 2021년도 방사선 및 방사성동위원소 이용실태조사 보고서 13쪽',
}

export const EV_TEXT: Evidence = {
  ...SURVEY_2021,
  chunkId: 'ev-text',
  sectionName: '제2장 제1절 총평 · 2. 방사선 이용기관 및 인력 현황',
  pageNo: 14,
  blockType: 'text',
  chunkContent:
    '2021년말 기준으로 방사선 관련 총 이용기관 수는 52,814개 기관으로 최근 5년간 연평균 3.2% 증가하였다. 이 중 비파괴검사, 원자력발전소를 포함한 산업분야 이용기관 수가 7,262개 기관으로 연평균 5.5% 증가하였다.',
  caption: '출처: 2021년도 방사선 및 방사성동위원소 이용실태조사 보고서 14쪽',
}

export const MSG_INTERNAL: ChatMessage = {
  id: 'm1',
  question: '최근 5년간 방사선 이용기관 수는 어떻게 변했나요?',
  evidenceType: 'INTERNAL',
  answer:
    '2021년말 기준 방사선 관련 총 이용기관은 52,814개소로, 최근 5년간 연평균 3.2% 증가했습니다.\n\n분야별로는 의료분야가 40,054개소로 가장 많고 산업분야 7,262개소, 동물병원 3,384개소 순입니다.',
  evidences: [EV_TABLE, EV_TEXT],
}

export const MSG_EXTERNAL: ChatMessage = {
  id: 'm2',
  question: '방사선 분야 종사자의 평균 연봉은 얼마인가요?',
  evidenceType: 'EXTERNAL',
  notice:
    '협회 보유 자료에서 근거를 찾지 못해 외부 생성형 AI의 일반 지식으로 답변합니다. 협회 문서에 근거한 답변이 아닙니다.',
  answer:
    '협회가 보유한 실태조사·이슈페이퍼·시장분석보고서에는 종사자 임금 통계가 포함되어 있지 않습니다.',
  evidences: [],
}

export const MSG_BLOCKED: ChatMessage = {
  id: 'm3',
  question: '(안전 정책에 걸리는 질문)',
  evidenceType: 'BLOCKED',
  notice: '요청하신 내용은 답변할 수 없습니다. 다른 표현으로 다시 물어봐 주세요.',
  answer: null,
  evidences: [],
}

export const MSG_NARROWED: ChatMessage = {
  id: 'm4',
  question: '학회리뷰보고서에 나온 이용기관 수를 알려주세요.',
  evidenceType: 'INTERNAL',
  scopeNarrowed: true,
  answer: '선택하신 범위에서는 관련 근거를 찾지 못했습니다.',
  evidences: [],
}

export const MSG_REPORT: ChatMessage = {
  id: 'm5',
  question: '방사성의약품 신약 개발 동향을 정리해 주세요.',
  evidenceType: 'INTERNAL',
  answer:
    '현재 400개 이상의 베타방출체·알파방출체 기반 신약이 임상 진행 중이며, 2030년 이후 환자 공급이 예상됩니다.',
  evidences: [
    {
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
        '현재 400개 이상의 베타방출체 및 알파방출체 기반 신약이 임상 진행 중이며 \u201930년 이후 환자에게 공급될 것으로 예상됨.',
      caption: '출처: 2025 KARA 이슈페이퍼 「방사성의약품 신약 개발 현황과 전망」 3쪽',
    },
  ],
  report: { title: '방사성의약품 신약 개발 동향 정리', url: '/reports/ri-drug-2025' },
}
