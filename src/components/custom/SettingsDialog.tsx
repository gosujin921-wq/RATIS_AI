import { useEffect, useState, type ReactNode } from 'react'
import { Modal } from 'krds-react'
import { Settings2 } from 'lucide-react'
import { ChipGroup } from './ChipGroup'
import './SettingsDialog.css'

/**
 * 설정 창 — 왼쪽 갈래 목록 + 오른쪽 설정 줄 (2026-09-02 도입).
 *
 * 왜 창인가: 설정은 **자주 여는 자리가 아니다.** 사이드바에 줄로 세워 두면 매 화면에
 * 자리를 차지하면서 정작 누르는 일은 드물다. 아이콘 하나로 접고, 열었을 때 넓게 편다.
 *
 * ★ 갈래를 **미리 만들어 두지 않았다.** 지금 이 시스템에 실제로 있는 설정은 화면 크기
 *   하나뿐이라 「알림」·「데이터」 같은 칸을 세우면 눌러도 빈 화면이 나온다.
 *   기획(§12.2 개인화 설정)이 확정되면 SECTIONS 에 줄만 더한다 — 레이아웃은 그대로다.
 *
 * ★ 공용 `Dialog` 로 만들지 않는다. 그쪽은 "무슨 일이 일어났는가" 를 알리고 걸음을 묻는
 *   작은 창(sm 400)이고 스스로 「폼이 든 창은 이것으로 만들지 않는다」고 적어 두고 있다.
 */

const TITLE_ID = 'ratis-settings-title'

/**
 * 화면 크기 다섯 단계. 이름·배율 모두 KRDS 가 정한 것을 그대로 쓴다
 * (`--krds-zoom-small ~ -xxlarge`).
 *
 * ★ 킷 `Resize` 컴포넌트를 쓰지 않는다 — **팝업이라서**다.
 *   설정 줄은 스크롤되는 패널 안에 있고, 그 안의 팝업은 조상 중 하나라도
 *   overflow 를 걸면 잘린다. 실제로 모달 패널을 고치자 이번엔 오른쪽 칸이 잘랐다.
 *   조상을 하나씩 열어 주는 건 다음 클리퍼가 나올 때까지만 버티는 수선이다.
 *
 *   갈래가 다섯이고 서로 대등하며 반드시 하나가 켜져 있는 축이라, design.md §4 의
 *   「채움 세그먼트」가 원래 이 자리의 모양이다 — 펼치지 않으니 잘릴 것도 없고,
 *   지금 어느 단계인지 열어 보지 않아도 보인다.
 *
 *   컨트롤은 우리 `ChipGroup`(single)이 그대로 지고, 이 파일이 더 하는 일은
 *   **고른 값을 body zoom 에 옮기는 세 줄**뿐이다 (킷 Resize 가 안에서 하던 것과 같다).
 */
const SCALE_LABEL = {
  sm: '작게',
  md: '보통',
  lg: '조금 크게',
  xlg: '크게',
  xxlg: '가장 크게',
} as const

const SCALES = ['sm', 'md', 'lg', 'xlg', 'xxlg'] as const

const ZOOM_VAR: Record<Scale, string> = {
  sm: '--krds-zoom-small',
  md: '--krds-zoom-medium',
  lg: '--krds-zoom-large',
  xlg: '--krds-zoom-xlarge',
  xxlg: '--krds-zoom-xxlarge',
}

type Scale = keyof typeof SCALE_LABEL

interface Section {
  key: string
  label: string
  icon: ReactNode
  rows: { label: string; desc?: string; control: ReactNode }[]
}

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [scale, setScale] = useState<Scale>('md')

  /* 고른 단계를 화면에 옮긴다. 배율 값은 KRDS 토큰에서 읽어 킷과 어긋나지 않게 한다 */
  useEffect(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(ZOOM_VAR[scale]).trim()
    if (v) document.body.style.zoom = v
  }, [scale])

  const sections: Section[] = [
    {
      key: 'general',
      label: '일반',
      icon: <Settings2 size={17} aria-hidden />,
      rows: [
        {
          label: '화면 크기',
          desc: '글자와 화면 요소를 다섯 단계로 키우거나 줄입니다.',
          control: (
            <ChipGroup
              className="set-scale"
              label="화면 크기"
              name="ratis-scale"
              size="small"
              single
              value={scale}
              onChange={setScale}
              options={SCALES.map((k) => ({ value: k, label: SCALE_LABEL[k] }))}
            />
          ),
        },
      ],
    },
  ]

  const [active, setActive] = useState(sections[0].key)
  const current = sections.find((s) => s.key === active) ?? sections[0]

  return (
    <Modal.Root size="lg" open={open} onOpenChange={onOpenChange}>
      {/* 킷은 aria-labelledby 를 걸지 않는다 — 직접 잇지 않으면 「대화상자」로만 읽힌다 */}
      <Modal.Content className="set-dialog" aria-labelledby={TITLE_ID}>
        <div className="set-body">
          {/* ── 왼쪽: 갈래 ─────────────────────────────────────────── */}
          <div className="set-side">
            {/* ★ 닫기 X 를 여기 두지 않는다 — 킷 Modal.Content 가 이미 오른쪽 위에 그린다.
                하나 더 두면 「설정 닫기」가 두 개로 읽히고 탭 순서에도 두 번 걸린다
                (2026-09-02 실측) */}
            <nav className="set-nav" aria-label="설정 갈래">
              {sections.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className="set-nav-item"
                  aria-current={s.key === active ? 'true' : undefined}
                  onClick={() => setActive(s.key)}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* ── 오른쪽: 설정 줄 ────────────────────────────────────── */}
          <div className="set-main">
            <h2 className="set-title" id={TITLE_ID}>
              {current.label}
            </h2>
            <div className="set-rows">
              {current.rows.map((r) => (
                <div className="set-row" key={r.label}>
                  <div className="set-row-text">
                    <p className="set-row-label">{r.label}</p>
                    {r.desc && <p className="set-row-desc">{r.desc}</p>}
                  </div>
                  <div className="set-row-control">{r.control}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal.Content>
    </Modal.Root>
  )
}
