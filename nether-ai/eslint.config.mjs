import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";
import eslintConfigNext from "eslint-config-next";

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    ...eslintConfigNext,
    plugins: {
      "@next/next": nextPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...eslintConfigNext.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // Add any custom rules here
    },
  },
];

export default eslintConfig;
