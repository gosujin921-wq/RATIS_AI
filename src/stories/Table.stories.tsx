import type { Meta, StoryObj } from '@storybook/react-vite'
import { Table } from '../components/ui/Table'

const meta = {
  title: '관리자 페이지/Table',
  component: Table,
  tags: ['autodocs'],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const documents = [
  { id: 'DOC-2026-0142', title: '방사선안전관리 실무 지침', kind: '지침', updated: '2026-08-19', state: '학습 완료' },
  { id: 'DOC-2026-0141', title: '방사성동위원소 취급 신고 절차', kind: '절차', updated: '2026-08-11', state: '학습 중' },
  { id: 'DOC-2026-0138', title: '방사선작업종사자 건강진단 기준', kind: '기준', updated: '2026-08-02', state: '대기' },
]

/** 정보 표 — 셸 없이 표만 쓴다. 두 칸짜리 표처럼 짚을 줄이 없는 자리용 */
export const Default: Story = {
  name: '기본',
  render: () => (
    <Table>
      <Table.Caption>학습 문서 목록</Table.Caption>
      <Table.Thead>
        <Table.Tr>
          <Table.Th scope="col">문서번호</Table.Th>
          <Table.Th scope="col">제목</Table.Th>
          <Table.Th scope="col">유형</Table.Th>
          <Table.Th scope="col">갱신일</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {documents.map((doc) => (
          <Table.Tr key={doc.id}>
            <Table.Td>{doc.id}</Table.Td>
            <Table.Td>{doc.title}</Table.Td>
            <Table.Td>{doc.kind}</Table.Td>
            <Table.Td>{doc.updated}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  ),
}

/**
 * 목록 표 — 카드 셸(`.ratis-table-shell`)로 감싼 형태. 관리자 목록 화면의 기본형이다.
 * 셸이 면 · 보더 · 라운드를 갖고, 줄에 마우스가 얹히면 그 줄을 짚어 준다.
 * 폭이 정해진 칸은 셸의 `--ratis-table-col-*` 척도로 못 박는다.
 */
export const CardShell: Story = {
  name: '카드 셸',
  render: () => (
    <div className="ratis-table-shell">
      <Table>
        <Table.Caption>학습 문서 목록</Table.Caption>
        <Table.Colgroup>
          <Table.Col width="16rem" />
          <Table.Col />
          <Table.Col width="var(--ratis-table-col-s)" />
          <Table.Col width="var(--ratis-table-col-m)" />
          <Table.Col width="var(--ratis-table-col-l)" />
        </Table.Colgroup>
        <Table.Thead>
          <Table.Tr>
            <Table.Th scope="col">문서번호</Table.Th>
            <Table.Th scope="col">제목</Table.Th>
            <Table.Th scope="col">유형</Table.Th>
            <Table.Th scope="col">갱신일</Table.Th>
            <Table.Th scope="col">학습 상태</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {documents.map((doc) => (
            <Table.Tr key={doc.id}>
              <Table.Td>{doc.id}</Table.Td>
              <Table.Td>{doc.title}</Table.Td>
              <Table.Td>{doc.kind}</Table.Td>
              <Table.Td>{doc.updated}</Table.Td>
              <Table.Td>{doc.state}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  ),
}

/** 표가 상자보다 넓을 때. 셸 없이 표 상자가 직접 민다 */
export const Scroll: Story = {
  name: '가로 스크롤',
  render: () => (
    <Table scroll>
      <Table.Caption>열이 많은 표</Table.Caption>
      <Table.Thead>
        <Table.Tr>
          {Array.from({ length: 10 }, (_, i) => (
            <Table.Th key={i} scope="col">
              항목 {i + 1}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          {Array.from({ length: 10 }, (_, i) => (
            <Table.Td key={i}>내용 {i + 1}</Table.Td>
          ))}
        </Table.Tr>
      </Table.Tbody>
    </Table>
  ),
}
