import { UserRound } from 'lucide-react'
import { BrandLogo } from '../components/custom/BrandLogo'
import { Button } from '../components/ui/Button'
import { href } from './basePath'
import './AdminHeader.css'

/**
 * 관리자 콘솔 머리 줄.
 *
 * 이용자 화면(AppShell)은 사이드바가 브랜드와 계정을 다 지고 있어 머리 줄이 없다. 관리자
 * 콘솔은 왼쪽을 메뉴가 쓰므로 브랜드와 계정이 설 자리가 여기다.
 *
 * ★ **브랜드 락업은 이용자 화면과 같은 것을 쓴다** (`BrandLogo`). 관리자라고 다른 로고를
 *   그리면 두 면이 다른 서비스로 읽힌다. 다른 면이라는 것은 락업 옆의 「관리자」 표식
 *   하나가 말한다 — 자리도 크기도 브랜드를 건드리지 않는 방식이다.
 * ★ **계정은 누를 수 없다.** 이용자 화면의 사용자 메뉴는 갈 곳(RATIS 홈·관리자 페이지)을
 *   갖고 있지만 관리자 콘솔에는 그 자리에서 갈 곳이 없다. 누를 수 있게 보이면 눌러 보고
 *   아무 일도 안 일어나는 것을 겪게 되므로, 같은 모양을 쓰되 표식으로만 세운다.
 * ★ **아래로 선 하나를 긋는다.** 이 줄은 바탕(canvas) 위에 뜬 카드가 아니라 화면 맨 위에
 *   붙어 있는 면이라, 톤만으로는 본문과 갈리지 않는다.
 */
export function AdminHeader({
  userName = '관리자',
  onLogout,
}: {
  /** 로그인한 사람. API 연동 전까지는 부르는 쪽이 넘긴다 */
  userName?: string
  /**
   * 로그아웃. 넘기지 않으면 버튼이 서지 않는다.
   * ⚠ 이 챗봇은 RATIS 본체 로그인을 그대로 쓰는 하위 서비스라, 여기서 끊는 것이 본체
   *   세션까지 끊는지가 아직 미정이다 (기획 §14 인증 연동). 이용자 화면의 사용자 메뉴가
   *   같은 이유로 로그아웃을 두지 않았다 — 정책이 정해지면 두 자리를 함께 본다.
   */
  onLogout?: () => void
}) {
  return (
    <header className="ratis-admin-header">
      <div className="ratis-admin-header-inner">
        <span className="ratis-admin-brand">
          <BrandLogo href={href('/admin/documents')} className="ratis-admin-logo" />
          <span className="ratis-admin-tag">관리자</span>
        </span>

        <span className="ratis-admin-util">
          {onLogout && (
            <Button variant="text" size="small" onClick={onLogout}>
              로그아웃
            </Button>
          )}
          <span className="ratis-admin-account">
            <UserRound aria-hidden />
            {userName}
          </span>
        </span>
      </div>
    </header>
  )
}
