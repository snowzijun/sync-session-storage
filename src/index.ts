export enum KEY_ENUMS {
  // 获取session
  GET_SESSION = '__zj_get_session',
  // 同步session
  SYNC_SESSION = '__zj_sync_session'
}

type SESSION_RESULT = { [key: string]: string | null }

type SYNC_TYPE = (sessions: SESSION_RESULT) => void

type BEFORE_SYNC_TYPE = (sessions: SESSION_RESULT) => SESSION_RESULT

type AFTER_SYNC_TYPE = (sessions: SESSION_RESULT) => void

// 同步方法，可供用户自定义同步的内容
let sync: SYNC_TYPE = (sessions: SESSION_RESULT) => {
  console.log(sessions)
  Object.entries(sessions).forEach(([key, value]) => {
    sessionStorage.setItem(key, value as string)
  })
}

// 同步前预处理器，
let beforeSync: BEFORE_SYNC_TYPE = (sessions: SESSION_RESULT) => {
  return sessions
}

let afterSync: AFTER_SYNC_TYPE | undefined = undefined

// 获取当前页面的session
const getSessions = (): SESSION_RESULT => {
  const sessions: SESSION_RESULT = {}
  for (let i = 0, len = sessionStorage.length; i < len; i++) {
    const key: string = sessionStorage.key(i) as string
    sessions[key] = sessionStorage.getItem(key)
  }
  return sessions
}

window.addEventListener('storage', (e: StorageEvent) => {
  const key: string | null = e.key
  if (KEY_ENUMS.GET_SESSION === key) {
    // 如果需要session,则将session 传过去
    const sessions: SESSION_RESULT = beforeSync(getSessions())
    if (sessions) {
      localStorage.setItem(KEY_ENUMS.SYNC_SESSION, JSON.stringify(sessions))
      // localStorage.removeItem(KEY_ENUMS.SYNC_SESSION)
    }
  } else if (KEY_ENUMS.SYNC_SESSION === key) {
    if (e.newValue) {
      const sessions: SESSION_RESULT = JSON.parse(e.newValue)
      sync(sessions)
      if (afterSync) {
        afterSync(sessions)
      }
    }
  }
})

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
    localStorage.setItem(KEY_ENUMS.GET_SESSION, `${Date.now()}`)
    // localStorage.removeItem(KEY_ENUMS.GET_SESSION)
  }
}
