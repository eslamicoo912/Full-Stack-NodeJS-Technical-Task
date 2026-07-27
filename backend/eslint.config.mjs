import tseslint from "typescript-eslint";

export default [
  {
    files: ["**/*.ts", "**/*.js"],
    ignores: ["node_modules", "dist", ".env"],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // --- TypeScript rules ---
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
];
