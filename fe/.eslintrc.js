module.exports = {
  extends: ['expo'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/immutability': 'off',
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/purity': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/no-require-imports': 'off'
  },
};
