import js from "@eslint/js";
import globals from "globals";

import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import reactNativePlugin from "eslint-plugin-react-native";

export default [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["dist", "node_modules"],

    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.es2021,
        __DEV__: true,
        // 필요 시 RN 전역 변수 추가 가능
      },
    },

    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-native": reactNativePlugin,
      prettier: prettierPlugin,
      "@typescript-eslint": tsEslintPlugin,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      ...tsEslintPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...reactNativePlugin.configs.recommended.rules,

      "@typescript-eslint/ban-ts-comment": "warn",
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off",
    },
  },
];
