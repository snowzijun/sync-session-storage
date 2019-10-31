module.exports = {
  root: true,

  parser: '@typescript-eslint/parser', //定义ESLint的解析器
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ], //定义文件继承的子规范
  parserOptions: {
    "ecmaVersion": 2019,
    "sourceType": 'module'
  },
  plugins: [
    '@typescript-eslint',

  ], //定义了该eslint文件所依赖的插件
  globals: {
    "process": true
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  "rules": {
    // 使用2个空格缩进
    "indent": ["error", 2, {
      SwitchCase: 1,
      flatTernaryExpressions: true
    }],
    // 是否能使用debugger,开发可以，线上不可以
    "no-debugger": process.env.NODE_ENV === 'development' ? "off" : "error",
    // switch必须提供 default
    "default-case": "error",
    // 禁止扩展原生属性
    "no-extend-native": "error",
    // 禁止一成不变的循环,防止代码出现死循环
    "no-unmodified-loop-condition": "error",
    // 禁止在变量未声明之前使用
    "no-use-before-define": "error",
    // 代码后不使用分号
    "semi": ["error", "never"],
    // 注释 // 或 /* 之后必须有一个空格
    "spaced-comment": ["error", "always"],
    // 禁止重复导入模块，对于同一模块内内容，应一次导入
    "no-duplicate-imports": "error",
    // 必须使用let 或 const, 不能使用var
    "no-var": "error",
    // js中应使用单引号替代双引号
    "quotes": ["error", "single"],
    // 要求大括号内必须有空格
    "object-curly-spacing": ["error", "always"],
    // 数组前后不需要添加空格
    "array-bracket-spacing": ["error", "never"],
    // 箭头函数前后必须要有空格
    'arrow-spacing': ["error", {
      'before': true,
      'after': true
    }],
    // 代码中可出现console
    'no-console': "off",
    // 正则中可以出现控制支付
    "no-control-regex": "off"
  }
}