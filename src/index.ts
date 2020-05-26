enum KEY_ENUMS {
  // 获取session
  GET_SESSION = '__zj_get_session',
  // 同步session
  SYNC_SESSION = '__zj_sync_session',
  // 给每个页签添加一个标记
  PAGE_IS_ALIVE_PREFIX = '__zj_page_alive',

  HEARTBEAT_KEY = '__zj_page__heartbeat_key'
}

type SESSION_RESULT = { [key: string]: string | null }

type SYNC_TYPE = (sessions: SESSION_RESULT) => void

type BEFORE_SYNC_TYPE = (sessions: SESSION_RESULT) => SESSION_RESULT

type AFTER_SYNC_TYPE = (sessions: SESSION_RESULT) => void

// 同步方法，可供用户自定义同步的内容
let sync: SYNC_TYPE = (sessions: SESSION_RESULT) => {
  Object.entries(sessions).forEach(([key, value]) => {
    sessionStorage.setItem(key, value as string)
  })
}

// 同步前预处理器，
let beforeSync: BEFORE_SYNC_TYPE = (sessions: SESSION_RESULT) => {
  return sessions
}

// 同步后处理器
let afterSync: AFTER_SYNC_TYPE | undefined = undefined

// 生成唯一值
const generateUUID = (): string => {
  let d: number = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
    c
  ) {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

// 添加心跳，30秒更新一次
const HEARTBEAT_KEY_VALUE = KEY_ENUMS.HEARTBEAT_KEY + '_' + generateUUID()
const addHeartBeat = (): void => {
  localStorage.setItem(HEARTBEAT_KEY_VALUE, `${Date.now()}`)
  setInterval(() => {
    localStorage.setItem(HEARTBEAT_KEY_VALUE, `${Date.now()}`)
  }, 1000 * 30)
}

addHeartBeat()

// 获取当前页面的session
const getSessions = (): SESSION_RESULT => {
  const sessions: SESSION_RESULT = {}
  for (let i = 0, len = sessionStorage.length; i < len; i++) {
    const key: string = sessionStorage.key(i) as string
    sessions[key] = sessionStorage.getItem(key)
  }
  return sessions
}

// 每个页面都有一个唯一的key，并已特定前缀开始
const getAliveKey = (): string => {
  const key = KEY_ENUMS.PAGE_IS_ALIVE_PREFIX + generateUUID()
  localStorage.setItem(key, key)
  return key
}

// 保存当前页面的key
const aliveKey = getAliveKey()

// 通过key的前缀判断当前页面是否唯一的
const isOnlyPage = (): boolean => {
  const len = localStorage.length
  let count = 0
  const now = Date.now()
  for (let i = 0; i < len; i++) {
    const key = localStorage.key(i)
    if (
      key !== null &&
      key.indexOf(KEY_ENUMS.HEARTBEAT_KEY) === 0 &&
      key !== HEARTBEAT_KEY_VALUE
    ) {
      const value: string | null = localStorage.getItem(key)
      if (value) {
        const time = parseInt(value)
        // 检测心跳，判断是否只有当前页面
        if (now - time < 35000) {
          count++
        }
      }

      if (count > 0) {
        return false
      }
    }
  }
  return true
}

// 为了防止IE的storage会自己调用自己，将页面唯一的key保存的传输的数据中
const sendSessionStorage = (
  key: KEY_ENUMS,
  value: string | Record<string, string>
): void => {
  localStorage.setItem(
    key,
    JSON.stringify({
      value,
      key: aliveKey
    })
  )
}

// 如果自己调用自己，则返回null,否则返回传输的数据
const getSessionStorage = (session: string | null): string | null => {
  if (session) {
    const { key, value } = JSON.parse(session)
    if (key !== aliveKey) {
      return value
    }
  }
  return null
}
window.addEventListener('storage', (e: StorageEvent) => {
  const key: string | null = e.key
  // 处理IE自己调用自己的问题
  if (KEY_ENUMS.GET_SESSION === key || KEY_ENUMS.SYNC_SESSION === key) {
    if (!getSessionStorage(e.newValue) && !isOnlyPage()) {
      return
    }
  }
  if (KEY_ENUMS.GET_SESSION === key) {
    // 如果需要session,则将session 传过去
    const sessions: SESSION_RESULT = beforeSync(getSessions())
    if (sessions) {
      sendSessionStorage(
        KEY_ENUMS.SYNC_SESSION,
        JSON.stringify({
          value: sessions,
          key: generateUUID()
        })
      )
    }
  } else if (KEY_ENUMS.SYNC_SESSION === key) {
    if (e.newValue) {
      const sessions = JSON.parse(getSessionStorage(e.newValue) as string)
      if (sessions) {
        sync(sessions.value)
        if (afterSync) {
          afterSync(sessions.value)
        }
        localStorage.removeItem(KEY_ENUMS.SYNC_SESSION)
      }
    }
  }
})

const onbeforeupload = window.onbeforeunload
window.onbeforeunload = (e: BeforeUnloadEvent): void => {
  localStorage.removeItem(aliveKey)
  localStorage.removeItem(HEARTBEAT_KEY_VALUE)
  if (isOnlyPage()) {
    localStorage.removeItem(KEY_ENUMS.GET_SESSION)
    localStorage.removeItem(KEY_ENUMS.SYNC_SESSION)
  }
  if (onbeforeupload) {
    onbeforeupload.call(window, e)
  }
}

export default {
  // 自定义同步方法
  sync: (callback: SYNC_TYPE | undefined): void => {
    if (callback) {
      sync = callback
    }
  },
  // 同步前，用户可对session进行预处理
  beforeSync: (callback: BEFORE_SYNC_TYPE | undefined): void => {
    if (callback) {
      beforeSync = callback
    }
  },
  // 同步之后调用
  afterSync: (callback: AFTER_SYNC_TYPE): void => {
    afterSync = callback
  },
  // 触发同步操作
  trigger: (): void => {
    // 如果当前只打开了一个页签，需要手动触发 afterSync事件
    if (isOnlyPage()) {
      if (afterSync) {
        afterSync({})
      }
    } else {
      sendSessionStorage(KEY_ENUMS.GET_SESSION, generateUUID())
    }
  }
}
