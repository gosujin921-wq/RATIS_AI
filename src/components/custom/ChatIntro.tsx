import { HeroCubes } from './HeroCubes'
import './ChatIntro.css'

/**
 * 시작 화면 — 대화가 아직 없을 때 스트림 자리에 선다.
 *
 * 오브는 **장식 전용**이다. 시스템이 살아 있다는 신호일 뿐이고, 뜻은 아래 문구가 진다
 * (보조기술에는 숨긴다).
 *
 * 문구는 **시스템이 무엇을 할 수 있는지** 밝힌다 (HAX G1). 「무엇이든 물어보세요」처럼
 * 범위를 열어 두면 답할 수 없는 것을 묻게 되고, 그 실패가 시스템 탓으로 남는다.
 */
export function ChatIntro() {
  return (
    <section className="chat-intro" aria-label="시작 안내">
      <div className="chat-orb" aria-hidden>
        {/* 캔버스를 오브 박스보다 세로 1.6배로 넓혀 띄운다 (ChatIntro.css 의 .chat-orb).
            카메라도 같은 배율만큼 물려야 큐브가 커지지 않는다 — 13 × 1.6 */}
        <HeroCubes centered cameraZ={20.8} />
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
