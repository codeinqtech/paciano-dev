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

export default defineConfig({
  base: resolvePublicBase(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173", 10),
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173", 10),
  },
});
