# RATIS AI 화면 앱

사용자용 AI 챗봇 화면과 관리자 화면. Vite + React 19 + TypeScript + Storybook.

API 는 붙어 있지 않다. `src/demo/` 의 목업으로 모든 화면과 상태를 볼 수 있다.
목업의 문서·수치는 **협회가 실제로 보유한 자료**에서 가져왔다 (`../docs/file_sample`).

## 실행

```bash
corepack pnpm install
corepack pnpm dev              # 5600  화면 앱
corepack pnpm storybook        # 5601  컴포넌트 스토리북
corepack pnpm storybook:pages  # 5602  시나리오 스토리북
corepack pnpm type-check
corepack pnpm build
```

포트는 셋 다 고정(`strictPort`)이다.

## 구조

```
src/styles/          토큰 정본 (ratis-tokens.css) · 바탕 · 연출 · 광학 보정
src/app/             셸 — AppShell(이용자) · AdminApp · layouts/
src/pages/chat/      대화 화면
src/pages/admin/     관리자 화면
src/components/ui/   기본 컴포넌트 — 어느 화면에서든 같은 뜻으로 서는 컨트롤
src/components/custom/  조합·도메인 부품 (대화·사이드바·차트 등)
src/api/types.ts     API 계약 타입 정본. 화면이 소비하는 데이터 형태다
src/demo/            목업 데이터와 조립부. 실연동 시 폴더째 삭제한다
src/stories/         Storybook — 낱개 부품 (5601)
src/stories/screens/ Storybook — 화면과 그 상태 (5602)
scripts/             원문 PDF 에서 지면 글자를 뽑는 스크립트
```

## 부품을 만들기 전에

**디자인 규칙 정본은 `design.md` 다.** 색·타이포·컨트롤 사다리·라운드 위계·한글 글줄이
거기서 정해진다. 값은 `src/styles/ratis-tokens.css` 하나에서 나온다.

- **사전을 먼저 본다.** `src/components/ui/` 에 있으면 그것을 쓴다. 모양이 조금 다르다고
  새로 그리지 않는다 — 같은 물건이 두 벌이 되면 값이 갈린다
- **숫자를 자리에 적지 않는다.** 토큰이 없으면 토큰을 먼저 만든다
- **두 곳 이상에서 같은 뜻으로 서면** 기본 컴포넌트(`ui/`)로 올린다. 한 화면 안에서만 뜻이
  서면 도메인 부품(`custom/`)으로 둔다
- 화면 파일은 **자리와 상태만** 진다. 무엇이 어떻게 생겼는지는 부품이 안다

외부 UI 킷은 2026-09-03 에 걷어냈다. 화면에 서는 것은 전부 우리 부품이다.
공공 디자인시스템(KRDS)은 **접근성 기준**으로만 남는다 — 대비 4.5:1, 포커스 표시,
터치 타깃 44, 색만으로 구분하지 않기.

## Storybook 두 벌

**스토리북이 둘이다. 무엇을 보느냐가 다르다.**

| | 컴포넌트 스토리북 | 시나리오 스토리북 |
|---|---|---|
| 명령 | `pnpm storybook` | `pnpm storybook:pages` |
| 포트 | 5601 | 5602 |
| 설정 | `.storybook/` | `.storybook-pages/` |
| 스토리 파일 | `src/stories/*.stories.tsx` | `src/stories/screens/*.stories.tsx` |
| 빌드 | `build-storybook` → `storybook-static` | `build-storybook:pages` → `storybook-pages-static` |
| 담는 것 | **부품 낱개** | **화면과 그 상태** |

### 무엇을 어디에 두는가

가르는 기준은 「페이지인가 아닌가」 하나다.

- **주소를 갖는 화면이면 시나리오(5602)** — 문서 관리 · 대화. 그 화면의 상태(기본 · 결과 없음 ·
  오류 · 좁은 폭)를 나란히 세워 한 장에서 견준다.
- **그 밖은 전부 컴포넌트(5601)** — 버튼·표 같은 낱개뿐 아니라 **창(모달)·팝오버·서랍도 부품이다.**
  화면을 덮고 뜬다고 화면인 것이 아니다. 삭제 확인 창을 고치려고 목록을 지나 버튼을 찾아
  누르게 만들지 않는다.

### 스토리를 쓸 때

- **부품을 만들면 스토리도 만든다.** 화면 안에서는 옆 파일 덕에 가려져 안 보이던 결함이
  낱개로 세우면 드러난다 (`.visually-hidden` 이 화면 CSS 에 갇혀 있던 것을 그렇게 찾았다).
- **창은 열린 채로 그린다.** 닫혀 있는 것이 기본값인 부품이라 그대로 두면 카탈로그에
  버튼 하나만 서고 정작 볼 것이 안 보인다. 닫아 본 뒤 다시 열 수 있게 버튼은 남긴다.
- **시나리오 스토리에 화면을 다시 짜지 않는다.** 실제 화면 부품을 그대로 태운다 —
  마크업을 복사하면 두 벌이 되고 곧 갈린다. 창도 마찬가지라, 화면과 스토리가 같은 것을
  태울 수 있게 부품으로 뽑는다 (`DocumentDeleteDialog`).

### 묶음 이름

```
5601  토큰            색 · 치수 · 타이포 · 그림자   ← 화면에 뜬 실제 CSS 변수를 읽어 그린다
      공통 컴포넌트    어느 화면에서든 같은 뜻으로 서는 것 (Button · Modal · Dropdown · Table …)
      AI chat         대화 · 사이드바 · 전체 레이아웃
      관리자 페이지     관리 화면에서만 서는 것 (DocumentFormModal · DocumentDeleteDialog …)

5602  이용자          대화
      관리자          문서 관리
```

## 원문 미리보기

원문 패널은 실제 PDF 에서 뽑은 지면 글자를 보여 준다.

```bash
python3 scripts/extract-source-pages.py   # → src/demo/data/source-pages.ts
```

손으로 옮겨 적지 않는다. 자료가 바뀌면 스크립트를 다시 돌린다.
스캔본(2022·2023년도 실태조사 보고서)은 글자층이 없어 OCR 전에는 뽑히지 않는다.

## 확인

화면을 고쳤으면 `type-check` 와 `build` 를 통과시키고, 1600·1400·1024·390 폭에서 눈으로 본다.
