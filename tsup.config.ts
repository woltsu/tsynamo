import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["cjs", "esm"],
  minify: true,
  treeshake: true,
  dts: true,
  tsconfig: "./tsconfig.json",
  sourcemap: true,
  // Include these packages to the bundle instead of expecting them to be importable from node_modules
  noExternal: ["@aws-sdk/client-dynamodb", "@aws-sdk/lib-dynamodb"],
});
