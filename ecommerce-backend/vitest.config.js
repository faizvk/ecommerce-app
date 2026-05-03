import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules/", "tests/", "scripts/"],
    },
    setupFiles: ["./tests/setup.js"],
    testTimeout: 10000,
  },
});
