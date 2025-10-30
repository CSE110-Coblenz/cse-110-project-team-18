// ESLint flat config (ESLint v9+)
// This file uses the "flat" configuration format. It replaces .eslintrc.* files.
// Install the devDependencies listed below before running eslint.

module.exports = [
	// Files/folders to ignore (replaces .eslintignore)
	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'build/**',
			'.git/**',
			'.vscode/**',
			'public/**',
			'*.d.ts',
		],
	},

	// Default for JS/TS files (basic environment)
	{
		files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.ts', '**/*.tsx'],
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: 'module',
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
	},

	// TypeScript rules
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			// The parser must be the parser object (module), not a string.
			// Use require(...) so ESLint receives an object with parse()/parseForESLint().
			parser: require('@typescript-eslint/parser'),
			parserOptions: {
				project: ['./tsconfig.json'],
				sourceType: 'module',
			},
		},
		plugins: {
			'@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
			import: require('eslint-plugin-import'),
			prettier: require('eslint-plugin-prettier'),
		},
		settings: {
			'import/resolver': {
				typescript: {},
			},
		},
		rules: {
			// Prettier integration
			'prettier/prettier': 'warn',

			// Common TypeScript rules (customize as you like)
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/explicit-module-boundary-types': 'off',
		},
	},
];
