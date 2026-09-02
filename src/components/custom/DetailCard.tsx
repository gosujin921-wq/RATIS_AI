import { FileDown, Paperclip } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './util'
import './DetailCard.css'

/**
 * 게시물 상세 카드 — 제목·메타·본문·첨부·하단 버튼으로 이뤄진 읽기 화면 표면.
 * KRDS 에 대응 컴포넌트가 없다. 공지사항 상세(SCREEN-017) · 활용사례 상세(SCREEN-019)가
 * 공유하고, 학습데이터 상세 · AI 모델 상세도 같은 골격을 쓴다.
 *
 * 조각 순서와 구분선 위치가 규칙이라 조합형으로 둔다. 사이에 다른 요소(대표 이미지 등)를
 * 끼워 넣을 수 있다.
 *
 *   <DetailCard>
 *     <DetailCard.Head title="…" badge={…} meta={[{ label: '작성일', value: '2026-07-10' }]} />
 *     <DetailCard.Body>…</DetailCard.Body>
 *     <DetailCard.Files items={[{ name: '…', size: '412 KB' }]} layout="panel" />
 *     <DetailCard.Rows items={[{ label: '이전글', value: <a …/> }]} />
 *     <DetailCard.Actions align="start"><Button …/></DetailCard.Actions>
 *   </DetailCard>
 *
 * 치수 기준: design.md §5 표면(흰 면 · slate 보더 · 라운드 16 · 패딩 24).
 */
export function DetailCard({
  as: Tag = 'article',
  children,
  className,
  ...rest
}: {
  /** 성격에 맞는 태그로 바꿀 수 있다 (기본 article) */
  as?: 'article' | 'div' | 'section' | 'nav'
  children: ReactNode
  className?: string
} & Pick<HTMLAttributes<HTMLElement>, 'aria-label'>) {
  return (
    <Tag className={cx('klid-detail-card', className)} {...rest}>
      {children}
    </Tag>
  )
}

/** 제목 + 메타 줄. 메타는 라벨·값 쌍이라 dl 로 그린다 */
function Head({
  title,
  badge,
  meta,
}: {
  title: string
  /** 제목 앞 배지 (중요 표시 등) */
  badge?: ReactNode
  meta?: { label: string; value: ReactNode }[]
}) {
  return (
    <header>
      <h2 className="klid-detail-subject">
        {badge}
        {title}
      </h2>
      {meta && meta.length > 0 && (
        <dl className="klid-detail-meta">
          {meta.map((m) => (
            <div key={m.label}>
              <dt>{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </header>
  )
}

/** 본문. 위 구분선으로 헤더와 나뉜다 */
function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('klid-detail-body', className)}>{children}</div>
}

export type DetailRowItem = {
  label: string
  value: ReactNode
}

/**
 * 라벨 │ 값 행 목록 — 「첨부파일 │ …」 「이전글 │ …」 처럼 **한 줄에 한 항목**을 담는 자리.
 * 라벨이 왼쪽에 서고 세로선으로 값과 갈린다. 행마다 가로선을 둬서, 면을 새로 깔지 않고도
 * 본문과 다른 성격의 정보임을 말한다.
 *
 * KeyValueList(rows) 와 다른 자리다 — 그쪽은 값을 오른쪽 끝선에 맞춰 **크기를 견주는** 판이고,
 * 여기는 값이 글(파일명·글 제목)이라 왼쪽에서 읽어 나간다.
 *
 * 값이 빈 행도 자리를 지킨다 — 앞뒤 글처럼 한쪽이 없을 수 있는 자리에서 행이 사라지면
 * 글을 옮겨 다닐 때마다 같은 것이 다른 높이에서 읽힌다. 없다는 말을 값 자리에 꽂는다.
 */
function Rows({
  items,
  ariaLabel,
  className,
}: {
  items: DetailRowItem[]
  /** 소제목을 달지 않는 자리에서도 보조기술이 읽을 이름은 준다 */
  ariaLabel?: string
  className?: string
}) {
  if (items.length === 0) return null
  return (
    <dl className={cx('klid-detail-rows', className)} aria-label={ariaLabel}>
      {items.map((item) => (
        <div key={item.label} className="row">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * 첨부파일 목록. 없으면 영역째 나오지 않는다 — 빈 구획을 남기면 파일이 있는데 못 불러온 것처럼 읽힌다.
 *
 *   layout="stack" (기본)  회색 면 위에 소제목 「첨부파일」 을 두고 그 아래로 파일을 쌓는다.
 *                          본문이 상자 없이 맨바닥에 서는 자리에서 첨부만 면을 얻어 갈린다
 *   layout="panel"         강조색 틴트 판 한 장. 제목에 건수를 병기하고 줄마다 내려받기 그림을
 *                          앞에 세운다 — 파일명이 읽을 글이 아니라 **누르면 받는 것**임을 말한다
 *
 * 판 꼴은 파일 크기를 적지 않는다: 이름이 길어 줄이 접히는 자리라 뒤에 붙은 수가 먼저 잘린다.
 */
function Files({
  items,
  layout = 'stack',
}: {
  items: { name: string; size: string }[]
  layout?: 'stack' | 'panel'
}) {
  if (items.length === 0) return null

  if (layout === 'panel') {
    return (
      <div className="klid-detail-files-panel">
        <h3>
          <Paperclip aria-hidden />
          {/* 이름과 건수를 한 덩이로 묶는다 — 묶지 않으면 줄의 gap 이 둘 사이에도 끼어
              「첨부파일」과 「(2)」가 따로 선 것처럼 벌어진다 */}
          <span>
            첨부파일 <span className="count">({items.length})</span>
          </span>
        </h3>
        <ul>
          {items.map((file) => (
            <li key={file.name}>
              <FileDown aria-hidden />
              <a href={`#${file.name}`}>{file.name}</a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="klid-detail-files">
      <h3>
        <Paperclip aria-hidden />
        첨부파일
      </h3>
      <ul>
        {items.map((file) => (
          <li key={file.name}>
            <a href={`#${file.name}`}>{file.name}</a>
            <span className="klid-detail-file-size">({file.size})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * 하단 버튼 자리 (목록으로 등). 기본은 가운데다.
 * 카드 안에 라벨 │ 값 행이 함께 서는 화면에서는 `align="start"` 로 왼쪽 시작선에 맞춘다 —
 * 행의 라벨과 같은 세로선에서 시작해야 버튼이 그 행들의 다음 걸음으로 읽힌다.
 */
function Actions({ children, align = 'center' }: { children: ReactNode; align?: 'center' | 'start' | 'end' }) {
  return (
    <div className="klid-detail-action" data-align={align}>
      {children}
    </div>
  )
}

DetailCard.Head = Head
DetailCard.Body = Body
DetailCard.Files = Files
DetailCard.Rows = Rows
DetailCard.Actions = Actions
