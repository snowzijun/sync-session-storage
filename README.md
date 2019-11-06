#### 说明
用于在浏览器多个页签之间同步`sessionStorage`,如用户新打开一个页签后，同步用户的登录`token`，防止页签之间登录状态不一致

#### 安装

```shell
npm install zj-sync-session -S
```
或
```shell
yarn add zj-sync-session
```


#### 示例
```javascript
import sessionSync from 'zj-sync-session'
/**
 * 对要同步的session进行处理，如对不需要同步的数据进行过滤，可不实现此钩子函数
 * 此钩子函数
 * sessions: {
 *  [key: string] : string | null
 * }
*/
sessionSync.beforeSync(sessions => {
  return sessions
})

/**
 * 自定义同步规则
 * 如果实现了sync接口，需要自己手动将session加入到sessionStorage
 * Object.keys(sessions).forEach(key => {
 *  sessionStorage.setItem(key, sessions[key])
 * })
*/
sessionSync.sync(sessions => {})

/**
 * 在数据同步完之后，可以在此处做后续处理
 * 
*/
sessionSync.afterSync(session => {})

/**
 * 触发同步, 在当前页面sessionStorage 修改之后，通过调用 trigger方法去同步
*/
sessionSync.trigger()
```