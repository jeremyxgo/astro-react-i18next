import eslint from "@eslint/js";
import configGitignore from "eslint-config-flat-gitignore";
import configPrettier from "eslint-config-prettier";
import pluginAstro from "eslint-plugin-astro";
import pluginImport from "eslint-plugin-import";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  configGitignore(),
  {
    files: ["**/*.{js,ts,jsx,tsx,mjs,astro}"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    plugins: {
      import: pluginImport,
      perfectionist: pluginPerfectionist,
      react: pluginReact,
    },
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginAstro.configs.recommended,
  {
    rules: {
      "astro/sort-attributes": "error",
    },
  },
  {
    files: ["**/*.{js,ts,jsx,tsx,mjs}"],
    ...pluginReact.configs.flat.recommended,
    ...pluginReact.configs.flat["jsx-runtime"],
    rules: {
      "react/jsx-sort-props": [
        "error",
        {
          callbacksLast: true,
          shorthandFirst: true,
        },
      ],
    },
  },
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          allowInterfaces: "always",
        },
      ],
      "import/newline-after-import": [
        "error",
        {
          considerComments: true,
        },
      ],
      "import/order": [
        "error",
        {
          alphabetize: {
            caseInsensitive: true,
            order: "asc",
          },
          "newlines-between": "never",
        },
      ],
      "perfectionist/sort-named-imports": "error",
    },
  },
  configPrettier,
];
