import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "dist/**",
      "next-env.d.ts"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Dev-only Node utility scripts are CommonJS and run directly with node.
    files: ["scripts/**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" }
  }
];

export default eslintConfig;
