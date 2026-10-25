import { defineConfig } from "tsup"

// Bundles src/ into dist/server.js. esbuild resolves the "@/" alias from tsconfig.
export default defineConfig({
  entry: ["src/server.ts"],
  format: "esm",
  platform: "node",
  target: "node24",
  outDir: "dist",
  clean: true,
  sourcemap: true,
})
