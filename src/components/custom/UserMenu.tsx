import { useEffect, useRef, useState } from 'react'
import { ChevronUp, ExternalLink, Shield, User } from 'lucide-react'
import type { Me } from '../../api/types'
import { href } from '../../app/basePath'
import './UserMenu.css'

/**
 * 회원 블록과 그 메뉴 — 사이드바 맨 아래.
 *
 * ★ 이름이 비어 올 수 있다 (API-031). 그때는 소속 표기가 이름 자리를 대신한다.
 * ★ 역할은 「등급」이 아니라 **소속 표기**까지만 쓴다 (SHELL-001).
 * ★ 사이드바 맨 아래라 메뉴를 **위로** 편다 — 아래로 떨어뜨리면 화면 밖으로 나간다.
 *
 * ★ **로그아웃을 두지 않는다** (2026-09-03). 이 챗봇은 RATIS 본체 로그인을 그대로 쓰는
 *   하위 서비스라, 여기서 끊는 것이 본체 세션까지 끊는지가 미확정이다 (기획 §14 인증 연동).
 *   나가는 길은 「RATIS 홈으로」가 진다. SSO 정책이 정해지면 이 자리를 다시 본다.
 *
 * ★ **관리자 페이지는 관리자에게만 선다.** 눌러도 막힐 길을 보여 주면 권한이 없다는 사실을
 *   오류로 배우게 된다. 사용자 화면과 관리자 화면은 별도 페이지다 (기획 §1.3).
 *
 * ★ **두 항목 다 새 창으로 연다** (2026-09-03). 둘 다 이 챗봇 밖으로 나가는 길인데, 같은
 *   창에서 열면 하던 대화를 두고 떠나게 된다. 대화는 주소를 갖지 않아서 뒤로 가기로
 *   되돌아와도 그 자리가 아니다. 새 창이면 대화는 그대로 남는다.
 *   나가는 길임을 글리프(↗)와 「새 창」 표기가 함께 말한다 — 표기가 없으면 보조기술 쓰는
 *   사람은 창이 바뀐 것을 뒤늦게 안다.
 */

/** RATIS 본체 홈. 챗봇은 그 안의 한 서비스라 돌아갈 자리가 있어야 한다 (기획 §5.1) */
const RATIS_HOME = 'https://www.ratis.or.kr/'

/** 관리자 콘솔의 첫 화면. 관리자가 매일 손대는 자리가 문서 관리다 (app/adminNav.ts) */
const ADMIN_HOME = '/admin/documents'

const ROLE_LABEL: Record<Me['role'], string> = {
  GENERAL: '일반회원',
  ASSOC: '협회회원',
  ADMIN: '관리자',
}

export function UserMenu({ me }: {
  /** API-031 응답. displayName 은 비어 올 수 있다 */
  me: Me
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  /* 바깥 누르기·Esc 로 닫는다 — 열어 두고 다른 곳을 볼 수 있어야 한다 */
  useEffect(() => {
    if (!open) return
    const onDown = (e: globalThis.MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="ratis-user-wrap" ref={ref}>
      <button
        type="button"
        className="ratis-user"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="ratis-avatar" aria-hidden>
          <User size={18} />
        </span>
        <span className="ratis-user-text">
          <span className="ratis-user-name">{me.displayName || ROLE_LABEL[me.role]}</span>
          {me.displayName && <span className="ratis-user-role">{ROLE_LABEL[me.role]}</span>}
        </span>
        <ChevronUp className="ratis-user-caret" size={16} aria-hidden />
      </button>

      {open && (
        <div className="ratis-user-menu" role="menu">
          <a
            className="ratis-user-item"
            role="menuitem"
            href={RATIS_HOME}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <ExternalLink size={16} aria-hidden />
            RATIS 홈으로
            <span className="visually-hidden">새 창</span>
          </a>
          {me.role === 'ADMIN' && (
            <a
              className="ratis-user-item"
              role="menuitem"
              href={href(ADMIN_HOME)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              <Shield size={16} aria-hidden />
              관리자 페이지
              <span className="visually-hidden">새 창</span>
            </a>
          )}
        </div>
      )}
    </div>
  )
}
