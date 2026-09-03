import { useMemo, useState } from 'react'
import { CircleCheck, FilePlus2, FileText, Loader, PencilLine, Trash2, TriangleAlert } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Dropdown } from '../../components/ui/Dropdown'
import { Table } from '../../components/ui/Table'
import { ToggleSwitch } from '../../components/ui/ToggleSwitch'
import { Tooltip } from '../../components/ui/Tooltip'
import { DateRangeFilter } from '../../components/custom/DateRangeFilter'
import { EmptyState } from '../../components/custom/EmptyState'
import { IconButton } from '../../components/custom/IconButton'
import { PageNav } from '../../components/custom/PageNav'
import { ResultCount } from '../../components/custom/ResultCount'
import { SearchField } from '../../components/custom/SearchField'
import { StatCard } from '../../components/custom/StatCard'
import { openableRow } from '../../components/custom/rowOpen'
import { AdminPageActions } from '../../app/layouts/AdminPageActions'
import { DEMO_CATEGORIES } from '../../demo/data/chat'
import {
  ADMIN_DOCUMENTS,
  CATEGORY_NAME,
  CORPUS_COUNT,
  CORPUS_TOTAL,
  INDEX_STATUS,
  type AdminDocument,
  type IndexStatus,
} from '../../demo/data/admin-documents'
import { DocumentDeleteDialog } from './DocumentDeleteDialog'
import { DocumentFormModal } from './DocumentFormModal'
import './admin.css'
import './AdminDocumentsPage.css'

/** 한 쪽 분량 */
const PAGE_SIZE = 10

/** 상태별 배지 색 — 뜻이 같으면 화면이 달라도 같은 색이다 */
const STATUS_TONE: Record<IndexStatus, 'success' | 'info' | 'danger'> = {
  INDEXED: 'success',
  INDEXING: 'info',
  FAILED: 'danger',
}

/** 사람이 읽는 크기. 표에서 세로로 훑어야 해서 소수 한 자리로 고정한다 */
function fileSize(bytes: number) {
  const mb = bytes / 1024 / 1024
  return mb < 1 ? `${Math.round(bytes / 1024)}KB` : `${mb.toFixed(1)}MB`
}

/**
 * 문서 관리 (`/admin/documents`).
 *
 * 챗봇이 답변 근거로 삼는 **자료 더미 자체를 상대하는 화면**이다. 이 서비스에서 관리자가
 * 매일 하는 일이 여기 있다 — 새 보고서를 들이고, 색인이 제대로 됐는지 보고, 안 된 것을
 * 다시 돌리고, 아직 안 열 문서를 잠가 둔다.
 *
 * ★ **상태와 공개를 갈라 세운다.** 색인 상태는 시스템이 정하는 값이고(운영자가 못 바꾼다),
 *   공개는 운영자가 정하는 값이다. 한 열에 섞으면 「색인 실패」와 「비공개」가 같은 급으로
 *   읽혀, 고쳐야 할 것과 그냥 잠가 둔 것이 구분되지 않는다.
 * ★ **줄이 창을 연다** (`openableRow`). 목록에서 하는 일은 「이 문서를 고른다」이지 「이
 *   글자를 누른다」가 아니다. 줄 안의 공개 토글과 지우기는 줄을 열지 않는다 — 부품이 걸러 낸다.
 * ★ **KPI 는 목록이 아니라 자료 더미 전체를 센다** (아래 `counted` 주석).
 * ★ 실패한 문서는 **사유를 그 자리에서 말한다.** 목록에 「실패」만 서 있으면 무엇을 해야
 *   하는지 알 수 없어 결국 한 건씩 열어 봐야 한다.
 *
 * 조회·등록·수정·삭제·재색인은 개발 단계 몫이다. 여기서는 조건 전환과 창 여닫기가 돈다.
 */
export function AdminDocumentsPage({ empty = false }: { empty?: boolean }) {
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<AdminDocument | undefined>()
  const [creating, setCreating] = useState(false)
  const [removing, setRemoving] = useState<AdminDocument | undefined>()
  const [published, setPublished] = useState<Record<string, boolean>>({})

  const rows = useMemo(() => {
    if (empty) return []
    return ADMIN_DOCUMENTS.filter((d) => {
      if (category && d.categoryId !== category) return false
      if (status && d.status !== status) return false
      if (keyword && !`${d.title} ${d.fileName}`.includes(keyword)) return false
      return true
    })
  }, [empty, category, status, keyword])

  const isPublished = (d: AdminDocument) => published[d.id] ?? d.published
  /* ★ KPI 는 **조건이 아니라 자료 더미 전체**를 센다 — 조건을 걸어 목록이 줄어도 「지금 이
     서비스가 몇 건을 물고 있는지」는 그대로 보여야 한다. 다만 아직 아무것도 안 들어온
     상태(empty)에서는 KPI 도 0 이다. 목록은 비었는데 위에 171 이 서 있으면 화면이 스스로
     어긋난다 */
  const counted = (s: IndexStatus) =>
    empty ? 0 : ADMIN_DOCUMENTS.filter((d) => d.status === s).length
  const corpusTotal = empty ? 0 : CORPUS_TOTAL
  const shown = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <AdminPageActions>
        <Button onClick={() => setCreating(true)}>
          <FilePlus2 aria-hidden />
          문서 등록
        </Button>
      </AdminPageActions>

      {/* 자료 더미 전체 — 조건과 무관하게 늘 같은 수를 말한다 */}
      <div className="ratis-admin-kpis">
        <StatCard icon={FileText} label="전체 문서" value={corpusTotal.toLocaleString()} unit="건"
          sub={`카테고리 ${Object.keys(CORPUS_COUNT).length}개`} />
        <StatCard icon={CircleCheck} label="색인 완료" value={counted('INDEXED')} unit="건"
          sub="답변 근거로 쓸 수 있는 문서" />
        <StatCard icon={Loader} label="색인 중" value={counted('INDEXING')} unit="건"
          sub="끝나면 자동으로 목록에 반영됩니다" />
        <StatCard icon={TriangleAlert} label="색인 실패" value={counted('FAILED')} unit="건"
          sub="사유를 확인하고 다시 돌려 주세요" />
      </div>

      <section className="ratis-admin-section">
        <div className="ratis-admin-section-head">
          <h2>등록 문서</h2>
        </div>

        {/* 조건 줄 — 왼쪽은 고르는 캡슐, 오른쪽 끝은 검색 */}
        <div className="ratis-admin-filterline">
          <div className="ratis-admin-filterline-lead">
            <div className="ratis-admin-conditions">
              <Dropdown
                variant="capsule"
                size="small"
                label="카테고리"
                value={category}
                onChange={(v) => {
                  setCategory(v)
                  setPage(1)
                }}
                aria-label="카테고리"
                options={[
                  { value: '', label: '전체' },
                  ...DEMO_CATEGORIES.map((c) => ({ value: c.categoryId, label: c.categoryName })),
                ]}
              />
              <Dropdown
                variant="capsule"
                size="small"
                label="색인 상태"
                value={status}
                onChange={(v) => {
                  setStatus(v)
                  setPage(1)
                }}
                aria-label="색인 상태"
                options={[
                  { value: '', label: '전체' },
                  ...(Object.keys(INDEX_STATUS) as IndexStatus[]).map((s) => ({
                    value: s,
                    label: INDEX_STATUS[s],
                  })),
                ]}
              />
              <DateRangeFilter label="등록 기간" size="sm" />
            </div>
            <span className="ratis-admin-divider" aria-hidden />
            <ResultCount total={rows.length} />
          </div>
          <SearchField
            variant="capsule"
            /* 조건 줄은 한 급으로 선다 — 옆의 캡슐 셀렉트·기간 칩이 sm(36)이다 */
            size="small"
            wrapClassName="ratis-admin-search"
            aria-label="문서 검색"
            placeholder="문서명 · 파일명으로 찾기"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.currentTarget.value)
              setPage(1)
            }}
          />
        </div>

        {/* 빈 자리 — **걸음을 붙이지 않는다.** 「문서 등록」은 이 화면 머리(AdminPageActions)에
            늘 서 있는 조작이라, 여기에 하나 더 두면 같은 단추가 한 화면에 두 벌이 된다.
            빈 목록에서 할 말은 「왜 비었는지」와 「무엇을 하면 채워지는지」까지다 */}
        {shown.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={empty ? '아직 등록된 문서가 없습니다.' : '조건에 맞는 문서가 없습니다.'}
            desc={
              empty
                ? '보고서를 올리면 색인을 만들어 챗봇이 답변 근거로 씁니다.'
                : '검색어나 조건을 바꿔 다시 찾아 주세요.'
            }
          />
        ) : (
          <>
            <div className="ratis-table-shell">
              <Table>
                <Table.Colgroup>
                  <Table.Col />
                  <Table.Col width="14rem" />
                  <Table.Col width="12rem" />
                  <Table.Col width="9rem" />
                  <Table.Col width="8rem" />
                  <Table.Col width="9rem" />
                  <Table.Col width="11rem" />
                  <Table.Col width="9rem" />
                </Table.Colgroup>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th scope="col">문서명</Table.Th>
                    <Table.Th scope="col">카테고리</Table.Th>
                    <Table.Th scope="col">색인 상태</Table.Th>
                    <Table.Th scope="col" className="ratis-admin-num">조각</Table.Th>
                    <Table.Th scope="col" className="ratis-admin-num">쪽</Table.Th>
                    <Table.Th scope="col" className="ratis-admin-num">용량</Table.Th>
                    <Table.Th scope="col">등록일</Table.Th>
                    <Table.Th scope="col">공개</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {shown.map((d) => (
                    <Table.Tr key={d.id} {...openableRow(() => setEditing(d))}>
                      <Table.Td>
                        <span className="ratis-admin-doc">
                          <span className="ratis-admin-doc-name">
                            {/* 파일명은 문서명에 확장자만 붙인 꼴이라 줄로 적지 않는다 — 아이콘이 파일임을 말하고, 실제 이름은 툴팁이 든다 */}
                            <Tooltip text={d.fileName}>
                              <span className="ratis-admin-doc-file">
                                <FileText aria-hidden />
                              </span>
                            </Tooltip>
                            <strong>{d.title}</strong>
                          </span>
                          {/* 실패 사유는 그 줄에서 말한다 — 열어 봐야 알면 목록이 제 몫을 못 한다 */}
                          {d.failReason && <em>{d.failReason}</em>}
                        </span>
                      </Table.Td>
                      <Table.Td>
                        <Badge tone="gray" shape="square">
                          {CATEGORY_NAME[d.categoryId]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge tone={STATUS_TONE[d.status]}>{INDEX_STATUS[d.status]}</Badge>
                      </Table.Td>
                      {/* 아직 정해지지 않은 값은 빈칸이 아니라 줄표다 — 0 과 「없음」은 다르다 */}
                      <Table.Td className="ratis-admin-num">
                        {d.chunkCount?.toLocaleString() ?? '–'}
                      </Table.Td>
                      <Table.Td className="ratis-admin-num">{d.pageCount ?? '–'}</Table.Td>
                      <Table.Td className="ratis-admin-num">{fileSize(d.bytes)}</Table.Td>
                      <Table.Td className="ratis-admin-date">{d.registeredAt}</Table.Td>
                      <Table.Td>
                        <div className="ratis-admin-rowactions">
                          <ToggleSwitch
                            size="sm"
                            aria-label={`${d.title} 챗봇 공개`}
                            checked={isPublished(d)}
                            /* 색인이 안 끝난 문서는 열 수 없다 — 근거로 쓸 조각이 아직 없다 */
                            disabled={d.status !== 'INDEXED'}
                            onChange={(next) => setPublished((p) => ({ ...p, [d.id]: next }))}
                          />
                          <Tooltip text="수정">
                            <span className="ratis-admin-rowaction">
                              <IconButton size="sm" aria-label={`${d.title} 수정`} onClick={() => setEditing(d)}>
                                <PencilLine aria-hidden />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip text="삭제">
                            <span className="ratis-admin-rowaction">
                              <IconButton size="sm" tone="danger" aria-label={`${d.title} 삭제`} onClick={() => setRemoving(d)}>
                                <Trash2 aria-hidden />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </div>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
            <PageNav
              totalPages={Math.ceil(rows.length / PAGE_SIZE)}
              page={page}
              onChange={setPage}
            />
          </>
        )}
      </section>

      <DocumentFormModal
        key={editing?.id ?? (creating ? 'new' : 'none')}
        open={creating || Boolean(editing)}
        document={editing}
        onClose={() => {
          setCreating(false)
          setEditing(undefined)
        }}
      />

      <DocumentDeleteDialog
        document={removing}
        onConfirm={() => setRemoving(undefined)}
        onClose={() => setRemoving(undefined)}
      />
    </>
  )
}
