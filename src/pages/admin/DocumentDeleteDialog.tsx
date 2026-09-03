import { Trash2 } from 'lucide-react'
import { Dialog } from '../../components/custom/Dialog'
import type { AdminDocument } from '../../demo/data/admin-documents'

/**
 * 문서 삭제 확인.
 *
 * 화면과 스토리가 **같은 것을 태우려고** 부품으로 뽑았다 — 문구를 두 곳에 적어 두면
 * 한쪽만 고쳐져 갈린다. 제목은 「무슨 일이 일어나는가」다 (누른 버튼 이름을 되풀이하지 않는다).
 *
 * ★ 무엇이 **함께** 사라지는지 적는다. 문서만 지워지는 것이 아니라 그 색인 조각까지
 *   사라지고, 그 결과 챗봇이 이 문서를 근거로 못 쓰게 된다 — 되돌릴 수 없는 걸음에서
 *   사람이 알아야 하는 것은 「무엇을 잃는가」다.
 */
export function DocumentDeleteDialog({
  document,
  onConfirm,
  onClose,
}: {
  /** 주면 열린다 */
  document?: AdminDocument
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Dialog
      open={Boolean(document)}
      onOpenChange={(next) => !next && onClose()}
      icon={<Trash2 aria-hidden />}
      title="지우면 되돌릴 수 없습니다"
      desc={
        <>
          <b>{document?.title}</b>와 그 색인 조각이 함께 지워집니다. 챗봇은 이 문서를 더 이상
          답변 근거로 쓰지 않습니다.
        </>
      }
      main={{ label: '지우기', onClick: onConfirm }}
      sub={{ label: '취소', close: true }}
    />
  )
}
