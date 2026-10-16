import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import stylistic from '@stylistic/eslint-plugin';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

// TSDoc is required on exported functions only: a private helper may keep a one-line comment.
const EXPORTED_FUNCTIONS = [
    'ExportNamedDeclaration > FunctionDeclaration',
    'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
    'ExportDefaultDeclaration > FunctionDeclaration',
];

export default [
    // .claude/worktrees/ holds the worktrees of claude -w: each one lints its own code.
    {
        ignores: ['dist/', 'node_modules/', '.astro/', 'db/migrations/', '.claude/worktrees/'],
    },

    js.configs.recommended,
    ...tseslint.configs.recommended,

    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            // A leading _ marks a parameter or variable that is unused on purpose.
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },

    ...eslintPluginAstro.configs.recommended,

    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
        },
    },

    // Formatting, documented in .claude/rules/format.md: `npm run lint -- --fix` applies it.
    {
        files: ['**/*.{ts,js,mjs,astro}'],
        plugins: { '@stylistic': stylistic },
        rules: {
            '@stylistic/indent': ['error', 4, { SwitchCase: 1 }],
            '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],
            '@stylistic/member-delimiter-style': 'error',
            '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
            '@stylistic/object-curly-spacing': ['error', 'always'],
            '@stylistic/array-bracket-spacing': ['error', 'never'],
            '@stylistic/comma-spacing': 'error',
            '@stylistic/key-spacing': 'error',
            '@stylistic/keyword-spacing': 'error',
            '@stylistic/space-before-blocks': 'error',
            '@stylistic/space-infix-ops': 'error',
            '@stylistic/type-annotation-spacing': 'error',
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
            '@stylistic/eol-last': 'error',
        },
    },

    // TSDoc on the data layer, documented in .claude/rules/commentaires.md.
    {
        files: ['db/**/*.ts', 'src/lib/**/*.ts'],
        ignores: ['**/*.test.ts'],
        plugins: { jsdoc },
        settings: { jsdoc: { mode: 'typescript' } },
        rules: {
            'jsdoc/require-jsdoc': ['error', {
                publicOnly: true,
                require: { FunctionDeclaration: true, ArrowFunctionExpression: true, FunctionExpression: true },
            }],
            'jsdoc/require-description': ['error', { contexts: EXPORTED_FUNCTIONS }],
            'jsdoc/require-param': ['error', { contexts: EXPORTED_FUNCTIONS }],
            'jsdoc/require-param-description': ['error', { contexts: EXPORTED_FUNCTIONS }],
            'jsdoc/require-returns': ['error', { contexts: EXPORTED_FUNCTIONS }],
            'jsdoc/require-returns-description': ['error', { contexts: EXPORTED_FUNCTIONS }],
            'jsdoc/require-hyphen-before-param-description': ['error', 'always'],
            'jsdoc/check-param-names': 'error',
            'jsdoc/check-tag-names': 'error',
            'jsdoc/no-types': 'error',
        },
    },

    // Each prop a component declares carries a doc comment; props inherited from HTMLAttributes are not declared here.
    {
        files: ['src/components/**/*.astro', 'src/layouts/**/*.astro'],
        plugins: { jsdoc },
        rules: {
            'jsdoc/require-jsdoc': ['error', {
                require: { FunctionDeclaration: false },
                contexts: ['TSInterfaceDeclaration[id.name="Props"] TSPropertySignature'],
            }],
        },
    },
];
