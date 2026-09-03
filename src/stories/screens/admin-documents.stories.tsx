import type { Meta, StoryObj } from '@storybook/react-vite'
import { AdminLayout } from '../../app/layouts/AdminLayout'
import { ADMIN_MENU } from '../../app/adminNav'
import { AdminDocumentsPage } from '../../pages/admin/AdminDocumentsPage'

/**
 * 문서 관리 (`/admin/documents`) — 관리자 콘솔.
 *
 * 셸(AdminLayout)에 화면을 태워 실제 폭에서 본다. 라우터가 없으므로 지금 열린 메뉴는
 * `currentKey` 로 넘긴다 — 라우터를 붙일 때 감싸는 쪽이 주소를 읽어 이 값만 채우면 된다.
 */
const meta = {
  title: '관리자/문서 관리',
  component: AdminDocumentsPage,
  parameters: {
    layout: 'fullscreen',
    /* 관리자 콘솔은 데스크톱 전용이다. 기준 폭 1600 에서 본다 */
    viewport: { defaultViewport: 'admin1600' },
  },
  decorators: [
    (Story) => (
      <AdminLayout
        items={ADMIN_MENU}
        currentKey="documents"
        userName="고수진"
        onLogout={() => {}}
      >
        <Story />
      </AdminLayout>
    ),
  ],
  args: {},
} satisfies Meta<typeof AdminDocumentsPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: '기본' }

/** 아직 한 건도 안 들어온 상태 — 등록하러 가는 길은 화면 머리의 「문서 등록」이 진다 */
export const Empty: Story = { name: '결과 없음', args: { empty: true } }
