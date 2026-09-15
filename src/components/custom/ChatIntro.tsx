import { HeroWave } from './HeroWave'
import { HeroOrbs } from './HeroOrbs'
import { HeroDrop } from './HeroDrop'
import './ChatIntro.css'

/** 시작 화면 심볼 타입 — wave(파동 + 도달, 기본) · orbs(유리 구슬 터짐 → 링, 2026-09-14 둘째 후보) ·
    drop(씨앗 → 링 → 방울 → 회전, 2026-09-14 셋째 후보 · 박스 없이 밝은 면 위) */
export type ChatIntroSymbol = 'wave' | 'orbs' | 'drop'

/**
 * 시작 화면 — 대화가 아직 없을 때 스트림 자리에 선다.
 *
 * 심볼은 **장식 전용**이다. 시스템이 살아 있다는 신호일 뿐이고, 뜻은 아래 문구가 진다
 * (보조기술에는 숨긴다). 2026-09-14 부터 파동 심볼(HeroWave)이다 — 3D 큐브는 걷어냈다.
 *
 * 문구는 **시스템이 무엇을 할 수 있는지** 밝힌다 (HAX G1). 「무엇이든 물어보세요」처럼
 * 범위를 열어 두면 답할 수 없는 것을 묻게 되고, 그 실패가 시스템 탓으로 남는다.
 *
 * 추천 질문은 여기 없다 — 입력창 **아래**에 선다 (ChatPage 의 SuggestedQuestions).
 * 여기 두면 문구와 입력창 사이가 벌어져 「무엇을 찾아드릴까요」와 답하는 칸이 떨어진다.
 *
 * `symbol` 은 심볼 타입 고르기다. 어느 타입으로 갈지는 아직 결정 전이라 기본은 wave 고,
 * 둘째(orbs)·셋째(drop) 타입은 스토리에서 나란히 본다. 결정되면 prop 을 걷고 하나로 굳힌다.
 */
export function ChatIntro({ symbol = 'wave' }: { symbol?: ChatIntroSymbol }) {
  return (
    <section className="chat-intro" aria-label="시작 안내">
      <div className="chat-orb" aria-hidden>
        {symbol === 'orbs' ? <HeroOrbs /> : symbol === 'drop' ? <HeroDrop /> : <HeroWave />}
      </div>
      <h1 className="chat-intro-title">무엇을 찾아드릴까요?</h1>
      <p className="chat-intro-desc">
        한국방사선진흥협회가 보유한 실태조사 통계표와 전문보고서에서
        <br />
        근거를 찾아 출처와 함께 답변합니다.
      </p>
    </section>
  )
}
