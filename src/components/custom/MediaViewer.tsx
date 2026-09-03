import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import './MediaViewer.css'

export interface MediaItem {
  id: string
  src: string
  /** 대체 텍스트. 캡션이 없는 자리(도식 등)에서도 이건 있어야 한다 */
  alt: string
  /** 확대 뷰 아래에 붙는 설명. 없으면 설명 줄이 뜨지 않는다 */
  caption?: string
  /** 영상이면 재생 표식과 길이를 얹는다 */
  kind?: 'IMAGE' | 'VIDEO'
  duration?: string
}

/**
 * 그림 확대 뷰 — 여러 장을 넘겨 가며 크게 보는 창.
 * KRDS 에 대응 컴포넌트가 없다. 학습데이터 상세 미리보기(SCREEN-005)와
 * AI 모델 상세 활용 가이드(SCREEN-034)가 공유한다.
 *
 * 여는 쪽이 `index` 로 제어한다 (null 이면 닫힘). 넘기기·닫기는 이 안에서 처리한다 —
 * 화면마다 좌우 키·범위 검사를 다시 짜면 한쪽만 빠뜨리게 된다.
 *
 * 그림은 `contain` 으로 통째로 보인다. 도식은 잘리면 뜻이 깨지고, 사진도 확대 뷰에서는
 * 잘라 보여줄 이유가 없다 (작게 볼 때와 달리 여기서는 전체를 보러 온다).
 *
 * 치수 기준: design.md §5 표면(모달). 크기는 lg — 그림을 보러 여는 창이라 본문 폭이 곧 정보량이다.
 */
export function MediaViewer({
  items,
  index,
  onIndexChange,
  title,
}: {
  items: readonly MediaItem[]
  /** 지금 열려 있는 장의 번호. null 이면 닫힘 */
  index: number | null
  onIndexChange: (next: number | null) => void
  /** 창 제목. 없으면 영상 여부로 정한다 */
  title?: string
}) {
  const item = index === null ? null : items[index]
  const step = (by: number) =>
    onIndexChange(index === null ? null : Math.min(items.length - 1, Math.max(0, index + by)))

  return (
    <Modal.Root size="lg" open={item != null} onOpenChange={(o) => !o && onIndexChange(null)}>
      <Modal.Content
        className="ratis-viewer"
        /* 좌우 화살표 키로도 넘긴다 — 그림을 훑는 자리에서 매번 버튼을 겨냥하게 하지 않는다 */
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
      >
        <Modal.Header title={title ?? (item?.kind === 'VIDEO' ? '영상 미리보기' : '이미지 미리보기')} />
        <Modal.Body>
          {item && (
            <figure>
              <img src={item.src} alt={item.alt} />
              {/* 실제 영상은 API 연결 후 재생기로 바꾼다. 지금은 정지 프레임 + 표식 */}
              {item.kind === 'VIDEO' && (
                <span className="play" aria-hidden>
                  <Play />
                </span>
              )}
              {(item.caption || item.duration) && (
                <figcaption>
                  {item.caption}
                  {item.kind === 'VIDEO' && item.duration && (
                    <span className="dur">{item.duration}</span>
                  )}
                </figcaption>
              )}
            </figure>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* 몇 장 중 몇 번째인지 — 넘기다 보면 끝이 어디인지 알 수 없다 */}
          <span className="ratis-viewer-count" aria-live="polite">
            {(index ?? 0) + 1} / {items.length}
          </span>
          <Button variant="secondary" disabled={index === 0} onClick={() => step(-1)}>
            <ChevronLeft aria-hidden />
            이전
          </Button>
          <Button
            variant="secondary"
            disabled={index === items.length - 1}
            onClick={() => step(1)}
          >
            다음
            <ChevronRight aria-hidden />
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
