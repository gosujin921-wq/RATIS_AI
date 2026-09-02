import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "krds-react/dist/index.css";
import "./styles/krds-theme.css";
import "./styles/krds-focus.css";
import "./index.css";
import "./styles/klid-optical.css";
// ★ 데모 진입점 — 실연동 시 DemoApp 대신 실제 App(라우터 + API 연동)을 꽂는다 (src/demo/README.md)
import { DemoApp } from "./demo/DemoApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
);
