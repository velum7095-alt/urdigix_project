import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const rootEl = document.getElementById("root");

if (!rootEl) {
  document.body.innerHTML = '<div style="padding:40px;font-family:sans-serif;color:red"><h1>❌ Root element missing from index.html</h1></div>';
} else {
  try {
    createRoot(rootEl).render(<App />);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    rootEl.innerHTML = `<div style="padding:40px;font-family:sans-serif;color:red;background:#fff;min-height:100vh"><h1>❌ React failed to mount</h1><pre style="background:#fee;padding:16px;border-radius:8px;white-space:pre-wrap">${msg}</pre></div>`;
  }
}
