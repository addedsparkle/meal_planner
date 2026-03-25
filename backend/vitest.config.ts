import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: "src",
    globals: true,
    testTimeout: 10000,
    env: {
      DATABASE_URL: ":memory:",
    },
  },
});
