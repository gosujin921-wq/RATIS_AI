import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tab, TabContent, TabList, TabPanel, TabTrigger } from '../components/ui/Tabs'

const meta = {
  title: '공통 컴포넌트/Tabs',
  component: Tab,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: '52rem' }}><Story /></div>],
  args: { children: null },
} satisfies Meta<typeof Tab>

export default meta
type Story = StoryObj<typeof meta>

const TERMS = {
  SERVICE: '이용약관',
  PRIVACY: '개인정보처리방침',
  COPYRIGHT: '저작권 정책',
}

export const Default: Story = {
  name: '기본',
  render: () => (
    <Tab defaultValue="SERVICE">
      <TabList>
        {Object.entries(TERMS).map(([code, label]) => (
          <TabTrigger key={code} value={code}>
            {label}
          </TabTrigger>
        ))}
      </TabList>
      <TabContent>
        {Object.entries(TERMS).map(([code, label]) => (
          <TabPanel key={code} value={code}>
            <p style={{ margin: 0 }}>{label} 버전 목록이 여기 선다.</p>
          </TabPanel>
        ))}
      </TabContent>
    </Tab>
  ),
}
