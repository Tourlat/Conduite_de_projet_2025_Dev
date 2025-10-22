import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
    { ignores: ['*.d.ts', '**/coverage', '**/dist'] },
    {
        extends: [
            eslint.configs.recommended,
            ...typescriptEslint.configs.recommended,
            ...eslintPluginVue.configs['flat/recommended'],
        ],
        files: ['**/*.{ts,vue}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: {
                parser: typescriptEslint.parser,
            },
        },
        rules: {
            // --- General ---
            'no-unused-vars': 'warn',          
            'no-console': 'warn',               
            'eqeqeq': ['error', 'always'],     
            'no-var': 'error',                  
            'prefer-const': 'warn',            
            'curly': ['error', 'all'],          
            'no-trailing-spaces': 'warn',      
            'semi': ['error', 'always'],        
            'quotes': ['error', 'single'],      

            // --- TypeScript ---
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off', 
            '@typescript-eslint/no-explicit-any': 'off',              
            '@typescript-eslint/no-non-null-assertion': 'off',         

            'vue/multi-word-component-names': 'off',
            'vue/no-mutating-props': 'warn',         
            'vue/no-unused-components': 'warn',       
            'vue/require-default-prop': 'off',        
            'vue/html-self-closing': ['error', {
                html: {
                    void: 'never',
                    normal: 'never',
                    component: 'always',
                },
            }],
        },
    },
    eslintConfigPrettier
);