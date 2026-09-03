import { forwardRef } from 'react'
import type {
  ColHTMLAttributes,
  ColgroupHTMLAttributes,
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react'
import { cx } from '../custom/util'
import './Table.css'

/**
 * 목록 표.
 *
 * `<table>` 을 감싸는 상자 하나와 표 구성요소들로 이뤄진 합성 컴포넌트다.
 * 상자가 있어야 화면보다 넓은 표를 밀 수 있고, 카드 셸(.ratis-table-shell)이
 * 둥근 모서리로 표를 물 수 있다.
 *
 * 쓰는 법 — 목록 표는 셸로 감싸고, 두 칸짜리 정보 표는 표만 쓴다.
 *
 *   <div className="ratis-table-shell">
 *     <Table>
 *       <Table.Colgroup><Table.Col width="9rem" /></Table.Colgroup>
 *       <Table.Thead><Table.Tr><Table.Th scope="col">번호</Table.Th></Table.Tr></Table.Thead>
 *       <Table.Tbody><Table.Tr><Table.Td>1</Table.Td></Table.Tr></Table.Tbody>
 *     </Table>
 *   </div>
 *
 * 접근성 — 머리 칸에는 `scope` 를 준다(열 머리 "col", 행 머리 "row").
 * 표가 무엇을 담는지는 `<Table.Caption>` 이 말한다. 화면에서 감추려면 화면 CSS 가
 * 맡는다 — 캡션을 지우면 표의 이름이 사라진다.
 */
export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** 표가 상자보다 넓을 때 좌우로 민다. 셸로 감싼 목록 표는 셸이 대신 민다 */
  scroll?: boolean
  /** 휴대폰에서 셸이 껍데기를 벗고 미는 상자가 된다. 셸과 함께 쓴다 */
  swipeEdge?: boolean
  /** 바깥 상자에 붙일 클래스. className 은 `<table>` 이 가져간다 */
  wrapClassName?: string
}

const TableRoot = forwardRef<HTMLTableElement, TableProps>(
  ({ scroll, swipeEdge, wrapClassName, className, children, ...rest }, ref) => (
    <div
      className={cx(
        'ratis-table',
        scroll && 'is-scroll',
        swipeEdge && 'is-swipe-edge',
        wrapClassName,
      )}
    >
      <table ref={ref} className={className} {...rest}>
        {children}
      </table>
    </div>
  ),
)
TableRoot.displayName = 'Table'

const Caption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
  (props, ref) => <caption ref={ref} {...props} />,
)
Caption.displayName = 'Table.Caption'

const Colgroup = forwardRef<HTMLTableColElement, ColgroupHTMLAttributes<HTMLTableColElement>>(
  (props, ref) => <colgroup ref={ref} {...props} />,
)
Colgroup.displayName = 'Table.Colgroup'

/** 열 폭. 셸의 `--ratis-table-col-*` 척도를 넘기면 목록 표끼리 폭이 맞는다 */
const Col = forwardRef<HTMLTableColElement, ColHTMLAttributes<HTMLTableColElement>>(
  ({ width, style, ...rest }, ref) => (
    <col ref={ref} style={width ? { width, ...style } : style} {...rest} />
  ),
)
Col.displayName = 'Table.Col'

const Thead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  (props, ref) => <thead ref={ref} {...props} />,
)
Thead.displayName = 'Table.Thead'

const Tbody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  (props, ref) => <tbody ref={ref} {...props} />,
)
Tbody.displayName = 'Table.Tbody'

const TFoot = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  (props, ref) => <tfoot ref={ref} {...props} />,
)
TFoot.displayName = 'Table.TFoot'

const Tr = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>((props, ref) => (
  <tr ref={ref} {...props} />
))
Tr.displayName = 'Table.Tr'

const Th = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  (props, ref) => <th ref={ref} {...props} />,
)
Th.displayName = 'Table.Th'

const Td = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  (props, ref) => <td ref={ref} {...props} />,
)
Td.displayName = 'Table.Td'

export const Table = Object.assign(TableRoot, {
  Caption,
  Colgroup,
  Col,
  Thead,
  Tbody,
  TFoot,
  Tr,
  Th,
  Td,
})
