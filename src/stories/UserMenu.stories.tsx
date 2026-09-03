import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserMenu } from '../components/custom/UserMenu'

/**
 * 회원 블록과 그 메뉴 — 사이드바 맨 아래.
 *
 * 이름이 비어 올 수 있다 (API-031). 그때는 소속 표기가 이름 자리를 대신한다.
 * 사이드바 맨 아래라 메뉴를 **위로** 편다 — 아래로 떨어뜨리면 화면 밖으로 나간다.
 *
 * **로그아웃을 두지 않는다.** 이 챗봇은 RATIS 본체 로그인을 그대로 쓰는 하위 서비스라,
 * 여기서 끊는 것이 본체 세션까지 끊는지가 미확정이다. 나가는 길은 「RATIS 홈으로」가 진다.
 *
 * **관리자 페이지는 관리자에게만 선다.** 눌러도 막힐 길을 보여 주면 권한이 없다는 사실을
 * 오류로 배우게 된다.
 */
const meta = {
  title: 'AI chat/사이드바/UserMenu',
  component: UserMenu,
  tags: ['autodocs'],
  /* 메뉴가 위로 펴지므로 위쪽 자리를 비워 둔다 */
  decorators: [
    (Story) => (
      <div style={{ width: '24rem', paddingTop: '20rem', background: 'var(--ratis-gray-5)' }}>
        <Story />
      </div>
    ),
  ],
  args: { me: { displayName: '김방사', role: 'ASSOC' } },
} satisfies Meta<typeof UserMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Assoc: Story = { name: '협회회원' }

export const Admin: Story = {
  name: '관리자',
  args: { me: { displayName: '이관리', role: 'ADMIN' } },
}

/** 이름이 비어 오면 소속 표기가 이름 자리를 대신한다 (AC-031) */
export const NoName: Story = {
  name: '이름 없음',
  args: { me: { displayName: '', role: 'GENERAL' } },
}
