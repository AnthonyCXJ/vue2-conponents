module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/prettier'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    indent: ['off', 2],
    'no-tabs': 'off',
    semi: [0],
    'no-mixed-spaces-and-tabs': [0],
    singleQuote: 0,
    'space-before-function-paren': 0,
    'no-unused-vars': 'warn', //把该条提示信息转换成警告信息
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
