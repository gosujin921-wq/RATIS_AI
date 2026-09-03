import { BarChart3, FileText, KeyRound, ScrollText, Settings, Users } from 'lucide-react'
import type { AdminMenuItem } from './layouts/AdminLayout'

/**
 * 관리자 콘솔 메뉴 — 요구사항 §1 이 적어 둔 관리 범위 그대로다
 * (문서 · 사용자 · 권한 · 로그 · 통계 및 서비스 운영 관리).
 *
 * ★ 차례는 **관리자가 하루에 손대는 빈도**로 잡았다. 이 서비스에서 매일 도는 일은 문서를
 *   들이고 색인 결과를 보는 것이라 문서가 맨 위다. 사용자·권한은 사람이 늘 때만, 로그·통계는
 *   되돌아볼 때 연다.
 * ★ 문서 관리 외 다섯은 **아직 화면이 없다.** 메뉴에 미리 세워 두는 것은 관리자 콘솔이
 *   무엇을 다루는 곳인지 첫 화면에서 드러나야 하기 때문이다 — 화면이 하나뿐인 메뉴는
 *   그 화면이 전부인 것처럼 읽힌다.
 */
export const ADMIN_MENU: AdminMenuItem[] = [
  { key: 'documents', label: '문서 관리', href: '/admin/documents', icon: FileText },
  { key: 'users', label: '사용자 관리', href: '/admin/users', icon: Users },
  { key: 'roles', label: '권한 관리', href: '/admin/roles', icon: KeyRound },
  { key: 'logs', label: '이용 로그', href: '/admin/logs', icon: ScrollText },
  { key: 'stats', label: '통계', href: '/admin/stats', icon: BarChart3 },
  { key: 'ops', label: '서비스 운영', href: '/admin/ops', icon: Settings },
]
