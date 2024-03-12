import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["cjs", "esm"],
  minify: true,
  treeshake: true,
  dts: true,
  tsconfig: "./tsconfig.json",
  sourcemap: true
});