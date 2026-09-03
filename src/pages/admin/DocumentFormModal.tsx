import { useState } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { DateInput } from '../../components/ui/DateInput'
import { FileUpload } from '../../components/ui/FileUpload'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { TextInput } from '../../components/ui/TextInput'
import { ToggleSwitch } from '../../components/ui/ToggleSwitch'
import { DEMO_CATEGORIES } from '../../demo/data/chat'
import type { AdminDocument } from '../../demo/data/admin-documents'
/* ★ 제 스타일을 **직접 물고 온다.** `.ratis-admin-form*` 규칙이 admin.css 에 있는데
   종전에는 목록 화면만 그 파일을 불러왔다 — 창을 목록 없이 띄우는 자리(스토리북)에서는
   두 칸 짝(카테고리·발행일)이 풀려 한 줄씩 쌓이고 스위치 면도 사라졌다 */
import './admin.css'

/** 올릴 수 있는 형식과 상한. 고르기 전에 알아야 하는 값이라 화면에도 그대로 적는다 */
const ALLOWED = ['application/pdf']
const ALLOWED_LABEL = 'PDF'
const MAX_MB = 200

/**
 * 문서 등록·수정 창.
 *
 * ★ **등록과 수정이 한 창이다.** 채우는 칸이 같고, 다른 것은 파일을 새로 받느냐뿐이다.
 *   창을 둘로 나누면 칸 하나를 더할 때마다 두 곳을 고쳐야 한다.
 * ★ **수정에서는 파일을 바꾸지 않는다.** 파일이 갈리면 색인을 처음부터 다시 돌려야 해서
 *   같은 문서의 수정이 아니라 새 문서를 들이는 일이 된다. 파일을 갈아야 하면 지우고 다시
 *   올리는 길로 보낸다 — 그래야 색인이 다시 도는 것이 화면에서 보인다.
 * ★ **공개는 여기서도 끌 수 있다.** 목록의 토글과 같은 값인데, 등록하는 순간 챗봇이 바로
 *   쓰기 시작하는 것이 늘 옳지는 않다 (검수 뒤에 여는 문서가 있다).
 *
 * 실제 올리기·저장은 개발 단계 몫이다. 여기서는 칸과 걸음만 선다.
 */
export function DocumentFormModal({
  open,
  document,
  onClose,
}: {
  open: boolean
  /** 주면 수정, 안 주면 등록 */
  document?: AdminDocument
  onClose: () => void
}) {
  const editing = Boolean(document)
  const [published, setPublished] = useState(document?.published ?? true)

  return (
    <Modal.Root open={open} onOpenChange={(next) => !next && onClose()} size="md">
      <Modal.Content className="ratis-admin-form-modal">
        <Modal.Header title={editing ? '문서 수정' : '문서 등록'} />
        <Modal.Body>
          <div className="ratis-admin-form">
            {editing ? (
              /* 늘 떠 있는 안내라 읽어 주지 않는다 — 동작의 결과가 아니다 */
              <Alert tone="info" live="none" title="파일은 바꿀 수 없습니다.">
                다른 파일로 갈아야 하면 이 문서를 지우고 새로 등록해 주세요. 파일이 바뀌면
                색인을 처음부터 다시 만듭니다.
              </Alert>
            ) : (
              <FileUpload
                title="문서 파일"
                description={`${ALLOWED_LABEL} · 1개당 최대 ${MAX_MB}MB. 올리면 곧바로 색인을 만듭니다.`}
                maxFiles={1}
                maxFileSize={MAX_MB * 1024 * 1024}
                acceptedFileTypes={ALLOWED}
              />
            )}

            <TextInput
              label="문서명"
              required
              defaultValue={document?.title}
              placeholder="목록과 답변 출처에 서는 이름"
              help="파일 이름과 달라도 됩니다. 이용자가 답변 출처에서 보는 이름입니다."
            />

            <div className="ratis-admin-form-pair">
              <Select
                label="카테고리"
                required
                defaultValue={document?.categoryId ?? DEMO_CATEGORIES[0].categoryId}
                options={DEMO_CATEGORIES.map((c) => ({
                  value: c.categoryId,
                  label: c.categoryName,
                }))}
                hint="이용자가 검색 범위로 고르는 갈래입니다."
              />
              <DateInput
                label="발행일"
                placement="up"
                defaultValue={document?.registeredAt}
                help="보고서에 적힌 날짜입니다. 올린 날이 아닙니다."
              />
            </div>

            <Textarea
              label="설명"
              rows={3}
              placeholder="이 문서가 무엇을 담고 있는지 한두 줄"
            />

            <div className="ratis-admin-form-switches">
              <ToggleSwitch
                label="챗봇 공개"
                description="끄면 색인은 만들되 답변 근거로는 쓰지 않습니다."
                checked={published}
                onChange={setPublished}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {/* 취소는 남긴다 — 우상단 X 와 겹치는 「닫기」가 아니라 적던 것을 버린다는 뜻이다 */}
          <Button variant="tertiary" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onClose}>{editing ? '저장' : '등록'}</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
