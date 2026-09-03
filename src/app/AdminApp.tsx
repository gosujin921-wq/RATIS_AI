import { EmptyState } from '../components/custom/EmptyState'
import { AdminDocumentsPage } from '../pages/admin/AdminDocumentsPage'
import { AdminLayout } from './layouts/AdminLayout'
import { ADMIN_MENU } from './adminNav'
import { href } from './basePath'
import { DEMO_ME } from '../demo/data/chat'

/**
 * 관리자 콘솔 진입부 — 사용자 화면과 **다른 페이지**다 (기획 §1.3).
 *
 * ★ **라우터가 아니다.** 주소에서 메뉴 하나를 골라 그 화면을 세우는 것이 전부다.
 *   이 앱에는 아직 라우터가 없고, 관리자 콘솔은 화면 사이를 오갈 뿐 대화처럼 상태를 이고
 *   다니지 않아서 여기까지면 된다. 라우터를 붙일 때 이 파일이 라우트 표로 바뀐다.
 * ★ 아직 화면이 없는 메뉴는 **빈 자리로 선다.** 메뉴에서 지우지 않는 까닭은 관리자 콘솔이
 *   무엇을 다루는 곳인지 첫 화면에서 드러나야 하기 때문이다 (adminNav.ts).
 */
export function AdminApp() {
  /* 주소 끝의 메뉴 키 하나. base path 를 걷어내고 본다 (배포 경로가 /portal 일 수 있다) */
  const path = window.location.pathname.replace(href('/admin'), '') || '/'
  const key = path.split('/').filter(Boolean)[0] ?? 'documents'
  const current = ADMIN_MENU.find((m) => m.key === key)

  return (
    <AdminLayout
      items={ADMIN_MENU}
      currentKey={current?.key ?? 'documents'}
      /* 데모값 — 실연동에서는 API-031 이 돌려주는 이름이 이 자리에 온다 */
      userName={DEMO_ME.displayName}
      onLogout={() => window.location.assign(href('/'))}
    >
      {current?.key === 'documents' || !current ? (
        <AdminDocumentsPage />
      ) : (
        <EmptyState
          title={`${current.label} 화면은 아직 준비 중입니다.`}
          desc="문서 관리부터 만들고 있습니다. 이 메뉴는 자리만 잡아 두었습니다."
        />
      )}
    </AdminLayout>
  )
}
