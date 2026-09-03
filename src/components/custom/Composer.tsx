import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import type { Category } from '../../api/types'
import { Dropdown } from '../ui/Dropdown'
import { Textarea } from '../ui/Textarea'
import { IconButton } from './IconButton'
import './Composer.css'

/**
 * 질문 입력 — 화면 아래에 도킹하는 캡슐 하나.
 *
 * ★ **캡슐 전체가 입력 영역이다.** 여백을 눌러도 커서가 입력칸에 들어온다. 보이는 상자와
 *   실제로 글자를 받는 자리가 다르면 가장자리를 눌렀을 때 아무 일도 일어나지 않아
 *   「눌러도 안 되는 칸」으로 읽힌다. 제 조작이 있는 자리(버튼·드롭다운)는 그대로 둔다.
 * ★ **한 줄이면 캡슐, 길어지면 라운드 스퀘어**가 된다. 모양이 곧 상태다 — 한 마디 묻는
 *   자리에서 글을 쓰는 자리로 바뀐다. 다섯 줄에서 멈추고 안에서 스크롤한다: 계속 자라게
 *   두면 긴 질문을 쓸수록 대화가 화면 밖으로 밀려 방금 읽던 답변을 잃는다.
 * ★ **보내기와 멈추기는 한 자리다.** 보내는 동안에는 보낼 수 없고 멈추면 다시 보낼 수 있다.
 *   답변 안에 중단 버튼을 따로 두면 스트림을 따라 내려가며 그걸 쫓아야 하는데, 컴포저는
 *   늘 같은 자리에 있다.
 */

/** 입력칸이 자라는 최대 줄 수 */
const MAX_LINES = 5

export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  pending,
  categories = [],
  scope,
  onScopeChange,
  maxLength = 2000,
}: {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  /** 넘기지 않으면 생성 중에도 정지 단추가 서지 않는다 */
  onStop?: () => void
  /** 답변을 기다리는 중인가 */
  pending?: boolean
  /** 검색 범위 (API-017). 비어 오면 그 자리를 그리지 않는다 */
  categories?: Category[]
  scope: string[]
  onScopeChange: (next: string[]) => void
  maxLength?: number
}) {
  const inputRef = useRef<HTMLDivElement>(null)
  /** 지금 몇 줄인가. 1이면 캡슐, 그 위로는 라운드 스퀘어가 된다 */
  const [lines, setLines] = useState(1)

  /* 입력한 만큼만 자란다. rows 로는 높이가 고정이라 여기서 직접 잰다.
     scrollHeight 는 내용 높이라, 한 번 auto 로 접었다 재야 줄어들 때도 따라온다 */
  useEffect(() => {
    const el = inputRef.current?.querySelector('textarea')
    if (!el) return
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 24
    el.style.height = 'auto'
    const need = Math.max(1, Math.round(el.scrollHeight / lh))
    const next = Math.min(MAX_LINES, need)
    el.style.height = `${next * lh}px`
    el.style.overflowY = need > MAX_LINES ? 'auto' : 'hidden'
    setLines(next)
  }, [value])

  const tooLong = value.length > maxLength

  return (
    <div className="chat-composer-shell">
      {/* 빛은 **형제**로 뺀다. 자식(::before, z-index -1)으로 두면 쌓임 맥락 안에서 부모
          배경 **위에** 칠해져 캡슐 안쪽까지 물든다 */}
      <span className="chat-composer-glow" aria-hidden />
      <div
        className="chat-composer"
        data-lines={lines}
        onMouseDown={(e) => {
          const el = e.target as HTMLElement
          if (el.closest('button, a, input, textarea, select, label, .ratis-dropdown')) return
          e.preventDefault()
          inputRef.current?.querySelector('textarea')?.focus()
        }}
      >
        <div className="chat-composer-main">
          {/* 검색 범위 — 입력줄 **안** 왼쪽 (기획 §5.3 확장 영역 · §12.2 「지식영역 선택」).
              종전에는 캡슐 아래 칩 줄이었다 (2026-09-03 교체). 갈래가 늘수록 칩 줄이 두 줄
              세 줄로 자라 입력창을 밀어 올렸고, 매 질문에 쓰는 값이 아닌데도 늘 펼쳐져 있어
              자리를 먼저 먹었다. 접어 넣으면 무엇이 걸려 있는지는 트리거 한 줄이 말한다.
              ★ 위로 펼친다 — 컴포저가 화면 바닥에 도킹돼 있어 아래로 열면 잘린다 */}
          {categories.length > 0 && (
            <Dropdown
              className="chat-scope"
              multiple
              size="small"
              variant="capsule"
              placement="up"
              label="범위"
              aria-label="검색 범위"
              options={[
                /* 아무것도 안 고른 상태가 곧 「전체」다 — 빈 값이 「못 고른 상태」로 읽히지
                   않게 목록 맨 위에 제 이름으로 세운다 (누르면 모두 해제) */
                { value: '', label: '전체 자료' },
                ...categories.map((c) => ({ value: c.categoryId, label: c.categoryName })),
              ]}
              values={scope}
              onChangeValues={onScopeChange}
            />
          )}

          <div className="chat-composer-input" ref={inputRef}>
            <Textarea
              label="질문"
              rows={1}
              placeholder="궁금한 내용을 입력하세요"
              value={value}
              onChange={onChange}
              onKeyDown={(e) => {
                // Enter 전송 · Shift+Enter 줄바꿈. 한글 조합 중 Enter 는 전송으로 치지 않는다
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  onSubmit()
                }
              }}
            />
          </div>

          <div className="chat-composer-send">
            {/* 글자 수는 한계에 가까울 때만 알린다 — 상시 노출은 자리만 먹는다 (AC-025) */}
            {value.length > maxLength * 0.8 && (
              <span className="chat-count" data-over={tooLong || undefined} aria-live="polite">
                {value.length.toLocaleString()} / {maxLength.toLocaleString()}자
              </span>
            )}
            {pending && onStop ? (
              <IconButton size="lg" shape="circle" filled aria-label="답변 생성 중단" onClick={onStop}>
                {/* 채운 네모 — 멈춤의 관습 표식 */}
                <Square aria-hidden fill="currentColor" strokeWidth={0} />
              </IconButton>
            ) : (
              <IconButton
                size="lg"
                shape="circle"
                filled
                aria-label="질문 보내기"
                disabled={value.trim().length === 0 || tooLong || pending}
                onClick={onSubmit}
              >
                <ArrowUp aria-hidden />
              </IconButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
