# src/demo/ — 데모 전용 코드

이 폴더는 **기획·디자인 검토용 목업 데이터와 조립부**만 담는다. 실연동(개발) 단계에서 **이 폴더째 삭제**하는 것을 전제로 한다.

## 경계 규칙

| 위치 | 성격 | 실연동 시 |
| --- | --- | --- |
| `src/api/types.ts` | API 계약 타입 (LogiCraft API-001·017·031 준수) | **유지** — API 클라이언트가 이 타입을 반환 |
| `src/app/` `src/pages/` | 순수 화면 — 데이터는 전부 props 로 받는다 | **유지** |
| `src/components/` | KLID_Portal 이식 컴포넌트 + 공용 부품 | **유지** |
| `src/demo/` | 목업 데이터 · 데모 조립부 | **삭제** |
| `src/mocks/samples.ts` | 이식 컴포넌트(Card 등)의 썸네일 폴백 심 | 해당 컴포넌트 사용 여부에 따라 정리 |

## 지켜야 할 것

- 화면 코드(`src/app`, `src/pages`)에서 `src/demo/` 를 import 하지 않는다. **의존 방향은 demo → 화면 한쪽뿐**이다.
- 목업 데이터의 필드명은 `src/api/types.ts` 를 따른다 — 계약에 없는 필드를 화면에 흘리지 않는다.
- 데모 진입점은 `src/main.tsx` → `DemoApp` 하나다. 실연동 시 이 한 줄을 실제 App 으로 바꾼다.
