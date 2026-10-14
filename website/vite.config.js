import { defineConfig, loadEnv } from "vite";
import { localNotesApi } from './dev-api.js';
export default defineConfig(({ command, mode }) => {
  const liveDev = command === 'serve' && mode === 'live';
  if (liveDev) {
    const env = loadEnv(mode, process.cwd(), '');
    for (const key of ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'VISITOR_COOKIE_SECRET']) {
      if (env[key] && !process.env[key]) process.env[key] = env[key];
    }
  }
  return {
    define: { __DEMO__: JSON.stringify(mode === 'demo' || (command === 'serve' && !liveDev)) },
    plugins: liveDev ? [localNotesApi()] : [],
    server: { host: "127.0.0.1" },
    build: { target: "es2022" },
  };
});
