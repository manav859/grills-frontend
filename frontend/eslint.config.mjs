import nextPlugin from '@next/eslint-plugin-next';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import tailwind from 'eslint-plugin-tailwindcss';
import tseslint from 'typescript-eslint';

/*
 * Flat config. Rule sources per 07-CODING-STANDARDS.md §8.1:
 *   @next/next (core-web-vitals) · @typescript-eslint strictTypeChecked ·
 *   jsx-a11y strict · import (order + no-default-export) · tailwindcss.
 *
 * Each plugin is registered exactly once. The Next plugin is applied directly
 * rather than through the legacy `next/core-web-vitals` shareable config, which
 * re-registers jsx-a11y and collides with the standalone strict a11y config.
 */
export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'next.config.ts',
      'postcss.config.mjs',
      'eslint.config.mjs',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  jsxA11y.flatConfigs.strict,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      import: importPlugin,
      react: reactPlugin,
      tailwindcss: tailwind,
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // Import ordering — 07 §3: groups separated by a blank line, alphabetised.
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-default-export': 'error',

      // Type-only imports are mandatory under verbatimModuleSyntax.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // Banned patterns — 07 §4.2.
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAnyKeyword',
          message:
            'any is banned (07 §4.2). Use unknown plus a narrowing guard.',
        },
        {
          selector: 'TSEnumDeclaration',
          message:
            'enum is banned (07 §4.2). Use an as const object plus a union.',
        },
      ],

      // dangerouslySetInnerHTML is allowed only at the two sites in 07 §6.
      'react/no-danger': 'error',

      // No console noise in committed code (07 §7.1).
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // Design tokens only — 05 §8.2 / 07 §8: no text-[17px], bg-[#fff], z-[999].
      // This rule is syntactic and works under Tailwind 4.
      'tailwindcss/no-arbitrary-value': 'error',
      // `no-custom-classname` and `classnames-order` are intentionally omitted:
      // eslint-plugin-tailwindcss 3.x cannot read Tailwind 4's CSS-first @theme
      // (styles/theme.css), so they cannot resolve the project tokens. Enabling
      // them here would either no-op or, against a stub JS config, reject valid
      // token utilities such as `bg-brand`. Re-enable once the plugin's Tailwind
      // 4 support stabilises. Tracked as a tooling gap — 07 §8.1 expects both.

      // A numeric HTTP status interpolated into an error message is safe and
      // intentional (see lib/api.ts); strings and numbers only, nothing else.
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],

      // Accessibility hard rules called out in 07 §8.1.
      'jsx-a11y/no-autofocus': 'error',
    },
  },

  // Next.js requires default exports from route entry files (07 §4.2 exception).
  {
    files: [
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      'src/app/**/error.tsx',
      'src/app/**/global-error.tsx',
      'src/app/**/not-found.tsx',
      'src/app/**/route.ts',
      'src/app/**/sitemap.ts',
      'src/app/**/robots.ts',
    ],
    rules: { 'import/no-default-export': 'off' },
  },
);
