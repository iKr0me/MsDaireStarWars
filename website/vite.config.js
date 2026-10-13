import { defineConfig } from "vite";
export default defineConfig(({ command, mode }) => ({
  define: { __DEMO__: JSON.stringify(command === "serve" || mode === "demo") },
  server: { host: "127.0.0.1" },
  build: { target: "es2022" },
}));
