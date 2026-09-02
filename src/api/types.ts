/**
 * API 계약 타입 — LogiCraft(ratis-rag-ai)의 API 명세를 따른다.
 *
 * ★ 이 파일은 데모용이 아니다. 화면이 소비하는 데이터 형태의 정본이며,
 *   실연동 시 API 클라이언트가 이 타입으로 응답을 돌려주면 화면은 그대로 동작한다.
 *   필드명은 계약(API-001 · API-017 · API-031)과 일치시킨다 — 임의로 바꾸지 않는다.
 */

/** API-017 — 검색 범위 카테고리. 평면 목록이며 건수는 담지 않는다 */
export interface Category {
  categoryId: string
  categoryName: string
}

/**
 * API-001 응답의 근거 유형 (SCREEN-001 ★ 반드시 구분 표시)
 *   INTERNAL 내부 자료 근거 · EXTERNAL 외부 LLM 응답(문서상 근거 아님) · BLOCKED 안전 필터 차단
 */
export type EvidenceType = 'INTERNAL' | 'EXTERNAL' | 'BLOCKED'

export interface Evidence {
  chunkId: string
  documentTitle: string
  categoryName: string
  sectionName?: string
  tableTitle?: string
  pageNo: number | null
  /** 'table' 이면 chunkContent 가 HTML 표다 (AC-037) */
  blockType: 'text' | 'table'
  chunkContent: string
  /** ★ 주·출처·단위 — 화면에서 생략 금지 (NFR-008) */
  caption?: string
}

/** API-001 질의 한 턴 — 질문과 그 응답 */
export interface ChatMessage {
  id: string
  question: string
  evidenceType: EvidenceType
  /** BLOCKED 이면 null (AC-026) */
  answer: string | null
  /** 적용된 내용 구성 반향. 표현 형식(서술형·개조식·표)은 계약에 없다 (DFEAT-021) */
  composition?: '요약' | '비교' | '정리'
  /** 차단·범위 축소·외부 응답 사유 안내 */
  notice?: string
  /** 범위를 좁혀서 못 찾음 → 범위를 넓혀 재시도 안내 (AC-034) */
  scopeNarrowed?: boolean
  /** INTERNAL 일 때만 채워진다 (AC-004) */
  evidences: Evidence[]
  /**
   * 후속 추천 질문 (기획 §5.4 · §12.1 필수).
   * ⚠ **API 계약에는 아직 없다.** 기획이 요구하는 화면 요소라 먼저 자리를 잡아 둔다 —
   *   계약이 확정되면 필드명을 거기에 맞춘다. 비어 오면 화면은 그 줄을 그리지 않는다.
   */
  followUps?: string[]
}

/**
 * 피드백 사유 (기획 §9). 부정 피드백·오류 신고에서 고른다.
 * ⚠ 계약에 아직 없다 — 저장·관리자 연계는 개발 영역이라고 기획이 명시한다.
 */
export const FEEDBACK_REASONS = [
  '답변이 부정확함',
  '출처가 적절하지 않음',
  '질문을 이해하지 못함',
  '답변이 너무 길거나 짧음',
  '화면 또는 기능 오류',
  '기타',
] as const

export type FeedbackReason = (typeof FEEDBACK_REASONS)[number]

/** 답변 한 건에 대한 피드백 */
export interface Feedback {
  /** true 도움이 됐어요 · false 도움이 안 됐어요 */
  helpful: boolean
  /** 부정 피드백일 때만. 여러 개 고를 수 있다 */
  reasons?: FeedbackReason[]
  /** 추가 의견 (선택) */
  comment?: string
}

/**
 * API-031 — 내 정보 조회. 셸이 진입 시 1회 호출한다 (SHELL-001).
 * 표시 판단 전용이며 메모리에만 둔다 — 브라우저 저장소 금지 (REQ-001).
 */
export interface Me {
  /** 비어 올 수 있다 — 폴백 표기는 화면 설계에서 정한다 */
  displayName: string
  role: 'GENERAL' | 'ASSOC' | 'ADMIN'
}

/**
 * API-022 — 대화 목록 한 건. 본인 것만 보인다 (AC-043).
 * ★ title 은 비어 올 수 있다 — 생성 규칙 미정이라 화면이 폴백을 가져야 한다 (AC-042).
 */
export interface ConversationSummary {
  conversationId: string
  title: string | null
  lastConversedAt: string
  /**
   * 고정 여부 — 고정한 대화는 목록 맨 위 「고정됨」 묶음에 시각과 무관하게 남는다.
   * ⚠ **API 계약에는 아직 없다.** 기획 §5.2 가 「대화 즐겨찾기」를 후속 기능으로 적어 둔
   *   항목이라 화면이 먼저 자리를 잡아 둔다 — 계약이 확정되면 필드명을 거기에 맞춘다.
   */
  pinned?: boolean
}


/**
 * 화면이 표현해야 하는 오류·제한 상태 (기획 §10.3).
 *
 * ★ 상태마다 화면을 갈아 끼우지 않는다. 기획이 *"오류가 발생해도 사용자가 입력한 질문과
 *   이미 표시된 대화가 가능한 한 유지되는 방식"* 을 못박았다 — 그래서 이 값들은 화면을
 *   덮는 것이 아니라 대화 위에 **띠 하나**로 얹힌다.
 */
export type ChatProblemKind =
  | 'SERVER'      // 서버 오류
  | 'OFFLINE'     // 네트워크 연결 끊김
  | 'TIMEOUT'     // 응답 지연 또는 시간 초과
  | 'AUTH'        // 인증 만료
  | 'FORBIDDEN'   // 접근 권한 없음
  | 'RATE_LIMIT'  // 요청 횟수 초과
  | 'MAINTENANCE' // 서비스 점검

export interface ChatProblem {
  kind: ChatProblemKind
  /** 다시 시도·다시 로그인 등 이 상태에서 할 수 있는 걸음. 없으면 안내만 한다 */
  onRetry?: () => void
}
