import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";

function resolvePublicBase(): string {
  const raw = process.env.VITE_BASE_PATH?.trim() || "";
  if (!raw) {
    return "/";
  }
  const normalized = raw.replace(/\/+$/, "").replace(/^\//, "");
  return `/${normalized}/`;
}

/** Laragon vhost — API lives under backend/public (not project root). */
const devProxyTarget =
  process.env.VITE_PROXY_TARGET?.trim() ||
  "http://app:8000";

export default defineConfig({
  base: resolvePublicBase(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  appType: "spa",
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173", 10),
    strictPort: true,
    proxy: {
      "/api": {
        target: devProxyTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173", 10),
  },
});
