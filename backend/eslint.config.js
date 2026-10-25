import js from "@eslint/js"
import prettier from "eslint-config-prettier"
import { defineConfig } from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig(
  { ignores: ["dist/", "logs/", "migrations/", "coverage/"] },

  js.configs.recommended,
  // Type-aware rules (they use tsconfig.json to understand types).
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // A forgotten `await` can skip a DB write or lose an error.
      "@typescript-eslint/no-floating-promises": "error",
      // Express 5 handles async route handlers, so passing them to routers is fine.
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { arguments: false } }],
      // `_name` = intentionally unused.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Use the logger (src/utils/logger.ts), not console.
      "no-console": "error",
    },
  },
  // env.ts reports bad settings before the logger exists.
  { files: ["src/config/env.ts"], rules: { "no-console": "off" } },
  // This config file itself is plain JS, outside tsconfig.
  { files: ["**/*.js"], extends: [tseslint.configs.disableTypeChecked] },

  // Leave formatting to Prettier (turns off rules that would clash with it).
  prettier
)
