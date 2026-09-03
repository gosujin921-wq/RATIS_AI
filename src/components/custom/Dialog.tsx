import type { ReactNode } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import './Dialog.css'

/**
 * **작은 창(sm 400) — 포털에 창은 이것 하나다** (2026-08-10 도입 · 2026-08-25 통일).
 *
 * ★ **문구가 다르다고 창을 새로 만들지 않는다.** 화면은 이 창에 글만 꽂는다 —
 *   `title` · `desc` · `main` · `sub`. 종전에는 문구 묶음마다 창 컴포넌트가 하나씩 있었고
 *   (로그인 벽 · 저장 상한 · 로그아웃 · 세션 만료), 그만큼 같은 모양이 네 군데로 갈려 한쪽을
 *   고치면 나머지가 뒤처졌다. 2026-08-25 에 전부 접었다.
 *
 * **정렬은 가운데로 하나다.** 머리 줄의 **첫 조각이 X 와 같은 줄을 쓴다** — 글리프가 있으면
 * 글리프가, 없으면 제목이 그 자리를 쓴다 (`data-mark`).
 * ```
 *  글리프 없음                      글리프 있음
 *      타이틀        ✕                [글리프]      ✕
 *    서브텍스트                          타이틀
 *   [경고 상자]                       서브텍스트
 *  ─────────────                    [경고 상자]
 *  [추가 내용] (왼쪽)                ─────────────
 *    메인 · 서브                     [추가 내용] (왼쪽)
 *                                     메인 · 서브
 * ```
 * 위 여백은 킷 기본 그대로다 — 킷 기본형이 곧 이 꼴이고, 아래로 밀어 X 줄을 비우면 창 위에
 * 빈 띠만 남는다. 좌우는 X 자리만큼 **같이** 비운다 (그래야 첫 조각이 창 한가운데에 선다).
 * 종전에는 정렬이 갈래 둘이었다 — 로그아웃·세션 만료가 킷 기본형(제목 왼쪽 · 걸음 오른쪽)으로
 * 서서 같은 폭 안에 두 모양이 번갈아 떴고, 사용자는 매번 새 창으로 읽었다.
 * **창의 성격은 글리프와 제목이 말하지, 정렬이 말하지 않는다.**
 *
 * 그 안에서 갈리는 것은 셋뿐이고 셋 다 이 창이 받는다:
 *   1. **글리프**(`icon`) — 있으면 성격을 한눈에 말하고(로그인 벽=자물쇠, 저장 상한=별),
 *      없으면 제목부터 선다 (로그아웃·삭제 확인처럼 하던 일의 연장인 창).
 *      걸음이 없는 창에는 쓰지 않는다 — 제목이 X 와 한 줄에 서서 얹을 자리가 없다.
 *   2. **경고 상자**(`alert`) — 서브텍스트 아래에서 지금 걸리는 것을 짚는다 (공용 `Alert`).
 *   3. **걸음 수** — `main`+`sub` 면 둘, `main` 만이면 하나, **둘 다 없으면 없다**
 *      (X 로만 닫는 안내 — 알리는 것이 전부라 고를 것이 없는 자리다).
 * 이 축들과 실제 창은 스토리북 `포털/Dialog` 한 카드에서 함께 본다.
 *
 * 폼이 든 창은 이것으로 만들지 않는다 (`DownloadRequestModal` · 즐겨찾기 별칭 수정) —
 * 고를 것이 여러 줄인 자리라 창이 커지고, 입력칸은 자기 라벨·검증 문구를 데리고 다닌다.
 *
 * **제목은 "무슨 일이 일어났는가" 다** — 창을 연 버튼 이름이 아니다 (`검색조건 저장` 이 아니라
 * `검색 조건은 5개까지 저장할 수 있습니다`). 버튼 이름을 그대로 쓰면 방금 누른 말을 되풀이할 뿐,
 * 왜 멈췄는지는 설명 줄까지 읽어야 알게 된다.
 *
 * 푸터에 `닫기` 를 두지 않는다 — 헤더 X 가 이미 나가는 길이다. 남는 것은 **여기서 갈 수 있는
 * 곳**뿐이다 (되돌릴 수 없는 창의 `취소`·`머무르기` 는 나가는 길이 아니라 고르는 걸음이라 남는다).
 *
 * ★ 걸음이 둘이면 **언제나 메인이 먼저 · 서브가 나중이다** (2026-08-25 확정, 예외 없음).
 *   되돌릴 수 없는 창이라고 안전한 쪽을 앞세우지 않는다 — 같은 자리의 버튼이 창마다 자리를
 *   바꾸면 사용자는 매번 어느 쪽이 무엇인지 다시 읽는다. **자리는 고정이고 무게는 색이 진다.**
 */
/**
 * 설명을 **문장 단위로** 끊어 세운다.
 *
 * 한 덩이로 흘리면 「지워집니다. 되돌릴」처럼 문장이 줄 가운데서 이어져, 읽는 호흡과
 * 줄바꿈이 어긋난다. 사실이 하나씩 제 줄에 서면 눈이 문장 끝에서 쉰다.
 *
 * ★ `<br>` 을 박지 않는다. 폭이 바뀌면 엉뚱한 자리에서 끊긴 채로 남는다 — 문장마다
 *   블록으로 세우고, 그 안에서만 접히게 한다.
 * ★ 조각(ReactNode)으로 온 설명은 그대로 둔다. 어디서 끊을지는 그것을 지은 쪽이 안다.
 */
function DescLines({ desc }: { desc: ReactNode }) {
  if (typeof desc !== 'string') return <>{desc}</>
  const lines = desc.split(/(?<=[.!?])\s+/).filter(Boolean)
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="ratis-dialog-line">
          {line}
        </span>
      ))}
    </>
  )
}

export function Dialog({
  open,
  onOpenChange,
  onClose,
  icon,
  title,
  tone = 'default',
  alert,
  desc,
  children,
  main,
  sub,
  confirmLabel,
  onConfirm,
  cancelLabel = '취소',
}: {
  open: boolean
  /** 창이 여닫히는 것을 위로 알린다. `onClose` 만 넘겨도 된다 */
  onOpenChange?: (open: boolean) => void
  /** 닫기 한 가지만 필요할 때. 확인 창에서는 이쪽이 짧다 */
  onClose?: () => void
  /**
   * 글리프만 넘긴다 — 감싸는 칩은 이 창이 갖는다 (크기·면·색이 창마다 갈리지 않게).
   * **없어도 된다.** 하던 일의 연장인 창은 그림 없이 제목부터 선다.
   */
  icon?: ReactNode
  /** **타이틀** — 무슨 일이 일어났는가. 창의 이름이자 보조기술이 읽는 이름이다 */
  title: string
  /**
   * 위험 톤 — **되돌릴 수 없는 걸음**을 묻는 창에 쓴다 (삭제 · 영구 제거).
   * 메인 버튼만 붉어진다. **취소는 그대로 둔다** — 되돌리는 길이 붉으면 무엇이 위험한
   * 걸음인지 뒤바뀐다.
   */
  tone?: 'default' | 'danger'
  /**
   * **서브텍스트 아래**에 서는 경고 상자(`Alert`). 설명이 무슨 일이 일어나는지 말하고,
   * 상자는 그 때문에 **지금 걸리는 것**을 짚는다 (2026-08-25 확정 — 종전에는 제목 바로 아래
   * 였는데, 상황을 말하기도 전에 경고부터 서서 무엇에 대한 경고인지 되짚어 읽어야 했다).
   * 부품은 공용 `Alert` 이라 톤·색이 화면의 다른 안내 띠와 함께 움직인다.
   */
  alert?: ReactNode
  /**
   * **서브텍스트** — 한두 줄로 끝낸다. 더 길어지면 이 창이 아니라 화면이 할 말이다.
   * 낱말 강조가 섞일 수 있어 글자만이 아니라 조각도 받는다 (세션 만료의 남은 시간 등).
   */
  desc?: ReactNode
  /**
   * 서브텍스트 아래 붙는 **추가 내용** — 목록이나 인증 버튼처럼 문장으로 안 되는 것.
   * **구분선으로 나뉘고 왼쪽 정렬로 선다** — 위는 창이 하는 말이고 여기는 그 말이 가리키는
   * 자료라, 성격이 갈리는 자리다 (2026-08-25 확정). 목록이면 **불렛도 창이 그린다.**
   * 없는 것이 보통이다. 여기에 폼을 넣지 않는다 (그건 다른 창이다).
   */
  children?: ReactNode
  /**
   * **메인 버튼** — 채움(primary). 이 창의 기본 걸음이다.
   * **없어도 된다** — 알리는 것이 전부인 창은 걸음이 없고 X 로만 닫는다
   * (보존기간 안내 · 휴대폰 번호 변경). 그때는 아랫동이 통째로 서지 않는다.
   */
  main?: Step
  /** **서브 버튼** — 테두리(secondary). 없으면 걸음이 하나뿐인 창이 된다 */
  sub?: Step
  /**
   * 확인 창 지름길 — `main`·`sub` 를 손으로 짜지 않고 「무엇을 하는가」만 준다.
   * 확인하면 그 일을 하고 창이 닫히고, 취소는 닫기만 한다.
   */
  confirmLabel?: string
  onConfirm?: () => void
  cancelLabel?: string
}) {
  const close = () => {
    onClose?.()
    onOpenChange?.(false)
  }

  /* 지름길로 온 것을 걸음으로 편다 — 아래는 한 가지 모양만 안다 */
  const mainStep: Step | undefined =
    main ??
    (confirmLabel
      ? { label: confirmLabel, onClick: () => { onConfirm?.(); close() } }
      : undefined)
  const subStep: Step | undefined =
    sub ?? (confirmLabel ? { label: cancelLabel, close: true } : undefined)

  const mainButton = mainStep ? <StepButton step={mainStep} tone={tone} /> : null
  const subButton = subStep ? <StepButton step={subStep} variant="secondary" /> : null
  /** 걸음이 있는지. 본문 **아래 여백**을 걸음 줄이 갖느냐를 가른다 (Dialog.css) */
  const hasSteps = mainButton || subButton ? 'yes' : 'none'
  return (
    <Modal.Root size="sm" open={open} onOpenChange={(o) => !o && close()}>
      {/* ★ 창의 **이름**을 직접 잇는다. `role="dialog" aria-modal` 만으로는 보조기술이
          「대화상자」라고만 읽고 제목을 읽지 않는다 */}
      <Modal.Content
        className="ratis-dialog"
        data-mark={icon ? 'yes' : 'none'}
        data-steps={hasSteps}
        aria-labelledby={TITLE_ID}
      >
        <Modal.Header>
          {icon ? <span className="ratis-dialog-mark">{icon}</span> : null}
          <Modal.Title id={TITLE_ID}>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* 설명이 따로 없으면 children 이 그 자리다 — 확인 창은 문장 한둘이 전부라
              설명과 자료를 갈라 둘 이유가 없다 */}
          <p>
            <DescLines desc={desc ?? children} />
          </p>
          {alert ? <div className="ratis-dialog-alert">{alert}</div> : null}
          {desc && children ? <div className="ratis-dialog-extra">{children}</div> : null}
        </Modal.Body>
        {/* 걸음이 하나도 없으면 아랫동을 세우지 않는다 — 빈 푸터는 창 아래에 여백만 남긴다.
            ★ 메인은 **오른쪽**이다 (2026-09-03). 읽는 방향의 끝이 「그래서 무엇을 하는가」의
              자리이고, 되돌리는 길(취소)이 그 앞에 선다. 종전에는 메인이 왼쪽이라 눈이
              먼저 닿는 자리에 되돌릴 수 없는 걸음이 있었다 */}
        {hasSteps === 'yes' ? (
          <Modal.Footer>
            {subButton}
            {mainButton}
          </Modal.Footer>
        ) : null}
      </Modal.Content>
    </Modal.Root>
  )
}

/** 창이 주는 걸음 하나. 글과 갈 곳(또는 할 일)만 넘긴다 — 크기·색은 창이 갖는다 */
export type Step = {
  /** 버튼에 쓰는 글 */
  label: string
  /** **다른 화면으로 가는 걸음**이면 주소를 준다 — 링크 성질(a)을 살린다 */
  href?: string
  /** 이 화면에서 **하는 일**이면 여기에 */
  onClick?: () => void
  /** 누르면 창이 닫히기만 하는 걸음 (`취소`·`머무르기`) */
  close?: boolean
  /** 조건을 채워야 누를 수 있는 걸음 */
  disabled?: boolean
}

/** 걸음 하나를 버튼으로. 크기는 sm(36) 이다 — 창이 400 폭이라 md(44)는 두 개가 서면
    아랫동이 창의 절반을 먹는다 (2026-09-03 한 급 낮춤) */
function StepButton({
  step,
  variant,
  tone,
}: {
  step: Step
  variant?: 'secondary'
  /** 위험 톤은 **메인 걸음에만** 실린다 — 서브(취소)는 안전한 쪽이라 색을 주지 않는다 */
  tone?: 'default' | 'danger'
}) {
  const button = step.href ? (
    <Button as="a" href={step.href} size="small" variant={variant} tone={variant ? undefined : tone}>
      {step.label}
    </Button>
  ) : (
    <Button
      size="small"
      variant={variant}
      tone={variant ? undefined : tone}
      disabled={step.disabled}
      onClick={step.onClick}
    >
      {step.label}
    </Button>
  )
  return step.close ? <Modal.Close asChild>{button}</Modal.Close> : button
}

/**
 * 제목 id. 창은 화면에 하나만 떠 있으므로 고정값으로 둔다 — 같은 페이지에 이 창이 둘 이상
 * 뜨는 일은 없다 (뜨면 뒤에 뜬 것이 앞을 덮는다).
 */
const TITLE_ID = 'ratis-dialog-title'
