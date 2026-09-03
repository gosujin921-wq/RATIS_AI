import { useEffect, useRef, useState } from 'react'
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Type,
  Underline,
  Undo2,
} from 'lucide-react'
import { Tooltip } from '../ui/Tooltip'
import { IconButton } from './IconButton'
import { cx } from './util'
import './RichTextEditor.css'

/**
 * 서식 있는 본문 편집기 (WYSIWYG).
 * 약관·방침의 본문처럼 **문단·목록·강조가 뜻을 갖는 글**을 쓰는 자리가 쓴다.
 * 줄글만 받는 자리는 `Textarea` 그대로다 — 서식이 필요 없는 곳에 편집기를 놓으면
 * 쓰는 사람이 꾸미기부터 하게 된다.
 *
 * 도구는 두 벌이다.
 *   full     문단 급(제목)·굵게·기울임·밑줄·목록 둘·링크·되돌리기 — 약관 본문
 *   minimal  굵게·기울임·목록 둘·링크 — 회원이 쓰는 자리(문의 작성)
 * 회원 쪽에서 제목 급을 빼는 것은 그 글이 남의 화면에서 제목처럼 서면 안 되기 때문이다.
 *
 * ★ **편집 엔진은 개발 단계에서 붙인다.** 지금은 브라우저 기본 편집 기능으로 도구가 실제로
 *   먹는 모습까지 만들어 두었고, 붙여넣기 정리(Word·HWP 잔재 제거)·허용 태그 제한처럼
 *   기성품이 해 주는 몫은 라이브러리(Tiptap 제안)를 붙일 때 들어온다.
 *   이 컴포넌트의 **바깥 모양과 props 는 그대로 두고 속만 갈아 끼우는 것**이 전제다.
 * ★ 저장된 HTML 을 화면에 다시 그리는 **뷰어는 이 부품의 몫이 아니다** — 공개 화면이 저장된
 *   글을 어떻게 그릴지(허용 태그)는 아직 정해지지 않았다.
 */
export function RichTextEditor({
  defaultValue = '',
  placeholder = '내용을 입력해 주세요',
  tools = 'full',
  minHeight = 32,
  ariaLabel,
  readOnly = false,
  className,
}: {
  /** 처음 그릴 HTML. 비제어다 — 값은 저장할 때 편집기에서 읽어 간다 */
  defaultValue?: string
  placeholder?: string
  tools?: 'full' | 'minimal'
  /** 본문 최소 높이 (rem). 글이 늘면 함께 늘어난다 */
  minHeight?: number
  ariaLabel?: string
  /** 읽기 전용 — 도구 줄이 서지 않고 글만 보인다 (시행중·폐지 버전을 열어 볼 때) */
  readOnly?: boolean
  className?: string
}) {
  const body = useRef<HTMLDivElement>(null)
  const [empty, setEmpty] = useState(!defaultValue)

  useEffect(() => {
    if (body.current) body.current.innerHTML = defaultValue
  }, [defaultValue])

  /* 서식은 선택 영역에 건다 — 도구를 누르면 초점이 본문을 떠나므로 먼저 돌려놓는다 */
  const run = (command: string, value?: string) => {
    body.current?.focus()
    document.execCommand(command, false, value)
    setEmpty(!body.current?.textContent?.trim())
  }

  const link = () => {
    const url = window.prompt('연결할 주소를 입력해 주세요', 'https://')
    if (url) run('createLink', url)
  }

  const full = tools === 'full'

  return (
    <div className={cx('ratis-editor', readOnly && 'is-readonly', className)}>
      {!readOnly && (
        /* 도구 줄 — 아이콘만 세우고 이름은 툴팁과 aria-label 이 갖는다 (관리 화면 행 조작과 같은 문법).
           ★ 이름은 버튼의 aria-label 이 정본이고 툴팁은 눈으로 보는 사람에게 한 번 더 말한다 */
        <div className="ratis-editor-tools" role="toolbar" aria-label="서식">
          {full && (
            <>
              <EditorTool label="제목" onRun={() => run('formatBlock', '<h3>')}>
                <Type aria-hidden />
              </EditorTool>
              <span aria-hidden className="ratis-editor-divider" />
            </>
          )}
          <EditorTool label="굵게" onRun={() => run('bold')}>
            <Bold aria-hidden />
          </EditorTool>
          <EditorTool label="기울임" onRun={() => run('italic')}>
            <Italic aria-hidden />
          </EditorTool>
          {full && (
            <EditorTool label="밑줄" onRun={() => run('underline')}>
              <Underline aria-hidden />
            </EditorTool>
          )}
          <span aria-hidden className="ratis-editor-divider" />
          <EditorTool label="글머리 목록" onRun={() => run('insertUnorderedList')}>
            <List aria-hidden />
          </EditorTool>
          <EditorTool label="번호 목록" onRun={() => run('insertOrderedList')}>
            <ListOrdered aria-hidden />
          </EditorTool>
          <EditorTool label="링크" onRun={link}>
            <Link2 aria-hidden />
          </EditorTool>
          {full && (
            <>
              <span aria-hidden className="ratis-editor-divider" />
              <EditorTool label="되돌리기" onRun={() => run('undo')}>
                <Undo2 aria-hidden />
              </EditorTool>
              <EditorTool label="다시 실행" onRun={() => run('redo')}>
                <Redo2 aria-hidden />
              </EditorTool>
            </>
          )}
        </div>
      )}

      {/* 안내 글자는 place holder 속성이 없는 자리라 빈 상태일 때만 겹쳐 그린다 */}
      <div className="ratis-editor-body-wrap">
        {!readOnly && empty && <p className="ratis-editor-placeholder">{placeholder}</p>}
        <div
          ref={body}
          className="ratis-editor-body"
          style={{ minHeight: `${minHeight}rem` }}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          role={readOnly ? undefined : 'textbox'}
          aria-multiline={readOnly ? undefined : true}
          aria-label={ariaLabel}
          onInput={() => setEmpty(!body.current?.textContent?.trim())}
        />
      </div>
    </div>
  )
}

/** 도구 한 개 — 아이콘 버튼 + 이름표. 누르면 초점이 본문을 떠나지 않게 기본 동작을 막는다 */
function EditorTool({
  label,
  onRun,
  children,
}: {
  label: string
  onRun: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip text={label}>
      <span className="ratis-editor-tool">
        <IconButton
          size="sm"
          tone="muted"
          aria-label={label}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onRun}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  )
}
