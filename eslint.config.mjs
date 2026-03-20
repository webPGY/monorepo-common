import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.d.ts']
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    }
  },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      }
    }
  },

  eslintConfigPrettier,
  eslintPluginPrettier,

  {
    rules: {
      'prettier/prettier': 'warn',

      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-expressions': 'error',
      'no-duplicate-imports': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'warn',
      'no-unneeded-ternary': 'error',
      'no-useless-return': 'error',
      'no-lonely-if': 'error',
      'prefer-template': 'warn',
      'object-shorthand': 'warn',
      'array-callback-return': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'multi-line'],

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',

      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'warn',
      'vue/no-mutating-props': 'error',
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'warn',
      'vue/require-explicit-emits': 'error',
      'vue/prefer-true-attribute-shorthand': 'warn',
      'vue/component-tags-order': ['error', { order: ['template', 'script', 'style'] }],
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/define-macros-order': [
        'warn',
        { order: ['defineProps', 'defineEmits', 'defineSlots'] }
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: { void: 'always', normal: 'never', component: 'always' },
          svg: 'always',
          math: 'always'
        }
      ]
    }
  },

  // Node 脚本使用 CommonJS require，关闭与 TS ESM 相关的规则
  {
    files: ['scripts/**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off'
    }
  },

  // packages 内引用 widgets 须使用包名（workspace / 已发布包），禁止相对路径、裸 widgets/、绝对路径或 file: 指向 widgets
  {
    files: ['packages/**/*.{js,ts,mjs,cjs,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex:
                '^((\\.\\./)+widgets(/|\\\\)|\\./widgets(/|\\\\)|widgets/|(?:file:|/|[~]|[A-Za-z]:[/\\\\]).*[/\\\\]widgets[/\\\\]|@widgets(/|$))',
              message:
                '禁止通过路径引用 widgets 目录，请使用包名（如 import x from "@openclaw/components"），并在 package.json 中声明依赖。'
            }
          ]
        }
      ]
    }
  }
]
