module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        'no-console': 'off',
        'no-unused-vars': 'warn',
        semi: ['error', 'always'],
        quotes: ['error', 'single'],
        indent: ['error', 4],
        'prefer-const': [1],
    },
    overrides: [
        {
            files: [
                '**/*.test.js',
            ],
            env: {
                jest: true,
            },
        },
    ],

};
