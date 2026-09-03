import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
/* ★ 차례가 곧 우선순위다. 토큰이 먼저 서고, 그 위에 바탕·연출이 얹힌다 */
import "./styles/ratis-tokens.css";
import "./styles/ratis-domain.css";
import "./styles/ratis-effects.css";
import "./index.css";
import "./styles/ratis-optical.css";
// ★ 데모 진입점 — 실연동 시 DemoApp 대신 실제 App(라우터 + API 연동)을 꽂는다 (src/demo/README.md)
import { DemoApp } from "./demo/DemoApp";
import { AdminApp } from "./app/AdminApp";
import { href } from "./app/basePath";

/* 사용자 화면과 관리자 콘솔은 **별도 페이지**다 (기획 §1.3). 라우터가 없으므로 주소로
   어느 앱을 세울지만 가른다 — 라우터를 붙이면 이 갈림이 라우트 표로 옮겨 간다.
   사이드바 사용자 메뉴의 「관리자 페이지」가 새 창으로 여는 주소가 이쪽이다 */
const isAdmin = window.location.pathname.startsWith(href("/admin"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isAdmin ? <AdminApp /> : <DemoApp />}</StrictMode>,
);
