import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    include: ["**/*.integration.test.ts/**"],
    exclude: ["**/node_modules/**", "**/build/**"],
    setupFiles: ["./test/setupIntegrationTests.ts"],
    hookTimeout: 30000,
    poolOptions: {
      threads: {
        // NOTE: This is needed as long as the different test files use the same DDB container
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../../shared"),
    },
  },
});
