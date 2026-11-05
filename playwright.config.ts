import { loadEnvConfig } from "@next/env";
import { defineConfig } from "@playwright/test";

loadEnvConfig(process.cwd());

// These tests write to the database in .env. A production server's database is
// also on localhost, so its host can't tell the two apart: only a machine that
// opted in may run them.
if (process.env.E2E_ALLOW_DATABASE !== "true") {
  throw new Error(
    "E2E test menulis ke database di .env. Kalau ini database lokal, tambahkan " +
      "E2E_ALLOW_DATABASE=true ke .env. Jangan lakukan ini di server produksi."
  );
}

const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  // One worker: every spec shares one server, one database, and its rate limiters.
  workers: 1,
  reporter: "list",
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: `http://localhost:${PORT}/web-cdre/`,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run build && npx next start -p ${PORT} -H localhost`,
    url: `http://localhost:${PORT}/web-cdre/admin/login`,
    // A server already on this port is one started by hand, to skip the build.
    reuseExistingServer: true,
    timeout: 5 * 60 * 1000,
    env: {
      BASE_PATH: "/web-cdre",
      // Cloudflare's always-pass test keys.
      TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
      TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
    },
  },
});
