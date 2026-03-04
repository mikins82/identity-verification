import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "**/.turbo/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "max-lines": ["warn", { max: 500, skipBlankLines: true, skipComments: true }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  {
    files: ["**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"],
    rules: {
      "max-lines": "off",
    },
  },
);
