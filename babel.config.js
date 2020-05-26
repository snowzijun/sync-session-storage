/*
 * @Author: 冯超
 * @Date: 2020-05-06 15:28:25
 * @LastEditors: 冯超
 * @LastEditTime: 2020-05-06 15:48:18
 * @Description: 文件说明
 * @FilePath: \zj-sync-session\babel.config.js
 */
module.exports = {
  presets: [
    [
      '@babel/env',
      {
        useBuiltIns: 'entry',
        corejs: {
          version: 3,
          proposals: true // 使用尚在“提议”阶段特性的 polyfill
        },
        targets: {
          chrome: '58',
          ie: '11'
        }
      }
    ],
    '@babel/typescript'
  ],
  plugins: ['babel-plugin-optimize-starts-with']
}
