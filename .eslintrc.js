module.exports = {
  extends: ['alloy', 'alloy/typescript'],
  env: {
    node: true
    // jest: true
  },
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  globals: {
    // myGlobal: false
  },
  rules: {
    'no-undef': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off'
  }
};
