import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Evidence } from '../api/types'
import { SourcePanel } from '../components/custom/SourcePanel'

/**
 * 출처 원문 패널 (기획 §5.5).
 *
 * ★ **페이지를 벗어나지 않는다.** 근거를 확인하려고 대화를 떠나면 돌아왔을 때 어디를
 *   읽고 있었는지 잃는다. 그래서 창이 아니라 옆에 서는 패널이다.
 *
 * 실제 문서 뷰어(PDF) 연결은 개발 영역이다. 여기서는 뷰어가 앉을 자리와 **그 자리가 가질 수
 * 있는 모든 상태**를 잡는다 — 상태를 나중에 붙이면 레이아웃이 흔들린다.
 *
 * 제목은 문서명이 아니라 **파일명**이다. 받은 파일과 화면에서 본 문서가 같은 것인지
 * 이름으로 확인하는 자리다.
 */
const EVIDENCE: Evidence = {
  chunkId: 'ev-table',
  documentTitle: '2021년도 방사선 및 방사성동위원소 이용실태조사 보고서',
  fileName: '2021년도 방사선 및 방사성동위원소 이용실태조사 보고서.pdf',
  fileUrl: '/files/survey/2021년도 방사선 및 방사성동위원소 이용실태조사 보고서.pdf',
  categoryName: '이용실태조사 보고서',
  pageCount: 410,
  tableTitle: '주요 지표 — 이용기관 수',
  pageNo: 13,
  blockType: 'table',
  chunkContent:
    '<table><thead><tr><th>구분</th><th>2019</th><th>2020</th><th>2021</th></tr></thead><tbody><tr><td>사업소 수</td><td>49,391</td><td>51,100</td><td>52,814</td></tr><tr><td>의료분야</td><td>38,061</td><td>39,098</td><td>40,054</td></tr><tr><td>산업분야</td><td>6,696</td><td>6,885</td><td>7,262</td></tr></tbody></table>',
  caption: '단위: 개소 · 출처: 2021년도 방사선 및 방사성동위원소 이용실태조사 보고서 13쪽',
}

const meta = {
  title: 'AI chat/대화/SourcePanel',
  component: SourcePanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  /* 패널은 세로를 채우는 부품이라 높이를 가진 부모가 있어야 제 모양이 선다 */
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: '60rem', background: 'var(--ratis-gray-5)' }}>
        <div style={{ flex: 1 }} />
        <div style={{ width: '48rem', display: 'flex' }}>
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    evidence: EVIDENCE,
    page: 13,
    pageCount: 410,
    onDownload: (e) => console.info('[스토리] 원문 다운로드', e.fileName),
  },
} satisfies Meta<typeof SourcePanel>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = { name: '원문 표시', args: { status: 'ready' } }

export const Loading: Story = { name: '불러오는 중', args: { status: 'loading' } }

/** 원문을 못 여는 상태에서도 **인용 근거는 남긴다** — 확인하러 온 목적이 통째로 막히지 않게 */
export const Unavailable: Story = {
  name: '표시할 수 없음',
  args: { status: 'unavailable', onRetry: () => {} },
}

export const Gone: Story = { name: '문서 없음 · 권한 없음', args: { status: 'gone' } }

/** 본문 블록이 표가 아닌 경우 */
/** 본문 블록이 표가 아닌 경우 — 다른 갈래의 문서 */
export const TextBlock: Story = {
  name: '본문 근거',
  args: {
    status: 'ready',
    page: 3,
    pageCount: 13,
    evidence: {
      chunkId: 'ev-ri-drug',
      documentTitle: '[2025 이슈페이퍼] 방사성의약품 신약 개발 현황과 전망',
      fileName: '[2025 이슈페이퍼] 방사성의약품 신약 개발 현황과 전망.pdf',
      fileUrl: '/files/issue/[2025 이슈페이퍼] 방사성의약품 신약 개발 현황과 전망.pdf',
      categoryName: '이슈페이퍼',
      pageCount: 13,
      sectionName: '01 요약문',
      pageNo: 3,
      blockType: 'text',
      chunkContent:
        '현재 400개 이상의 베타방출체 및 알파방출체 기반 신약이 임상 진행 중이며 \u201930년 이후 환자에게 공급될 것으로 예상됨. 국내의 경우, 전문기업 투자 증가, 일반의약품 대기업의 방사성의약품 산업 진입 등으로 신약개발 투자가 지속 확대 중임.',
      caption: '출처: 2025 KARA 이슈페이퍼 「방사성의약품 신약 개발 현황과 전망」 3쪽',
    },
  },
}
