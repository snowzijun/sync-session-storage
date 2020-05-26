(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var KEY_ENUMS;
    (function (KEY_ENUMS) {
        // 获取session
        KEY_ENUMS["GET_SESSION"] = "__zj_get_session";
        // 同步session
        KEY_ENUMS["SYNC_SESSION"] = "__zj_sync_session";
        // 给每个页签添加一个标记
        KEY_ENUMS["PAGE_IS_ALIVE_PREFIX"] = "__zj_page_alive";
        KEY_ENUMS["HEARTBEAT_KEY"] = "__zj_page__heartbeat_key";
    })(KEY_ENUMS || (KEY_ENUMS = {}));
    // 同步方法，可供用户自定义同步的内容
    var sync = function (sessions) {
        Object.entries(sessions).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            sessionStorage.setItem(key, value);
        });
    };
    // 同步前预处理器，
    var beforeSync = function (sessions) {
        return sessions;
    };
    // 同步后处理器
    var afterSync = undefined;
    // 生成唯一值
    var generateUUID = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
        return uuid;
    };
    // 添加心跳，30秒更新一次
    var HEARTBEAT_KEY_VALUE = KEY_ENUMS.HEARTBEAT_KEY + '_' + generateUUID();
    var addHeartBeat = function () {
        setInterval(function () {
            localStorage.setItem(HEARTBEAT_KEY_VALUE, "" + Date.now());
        }, 1000 * 30);
    };
    addHeartBeat();
    // 获取当前页面的session
    var getSessions = function () {
        var sessions = {};
        for (var i = 0, len = sessionStorage.length; i < len; i++) {
            var key = sessionStorage.key(i);
            sessions[key] = sessionStorage.getItem(key);
        }
        return sessions;
    };
    // 每个页面都有一个唯一的key，并已特定前缀开始
    var getAliveKey = function () {
        var key = KEY_ENUMS.PAGE_IS_ALIVE_PREFIX + generateUUID();
        localStorage.setItem(key, key);
        return key;
    };
    // 保存当前页面的key
    var aliveKey = getAliveKey();
    // 通过key的前缀判断当前页面是否唯一的
    var isOnlyPage = function () {
        var len = localStorage.length;
        var count = 0;
        var now = Date.now();
        for (var i = 0; i < len; i++) {
            var key = localStorage.key(i);
            if (key !== null &&
                key.indexOf(KEY_ENUMS.HEARTBEAT_KEY) === 0 &&
                key !== HEARTBEAT_KEY_VALUE) {
                var value = localStorage.getItem(key);
                if (value) {
                    var time = parseInt(value);
                    // 检测心跳，判断是否只有当前页面
                    if (now - time < 35000) {
                        count++;
                    }
                }
                if (count > 1) {
                    return false;
                }
            }
        }
        return true;
    };
    // 为了防止IE的storage会自己调用自己，将页面唯一的key保存的传输的数据中
    var sendSessionStorage = function (key, value) {
        localStorage.setItem(key, JSON.stringify({
            value: value,
            key: aliveKey
        }));
    };
    // 如果自己调用自己，则返回null,否则返回传输的数据
    var getSessionStorage = function (session) {
        if (session) {
            var _a = JSON.parse(session), key = _a.key, value = _a.value;
            if (key !== aliveKey) {
                return value;
            }
        }
        return null;
    };
    window.addEventListener('storage', function (e) {
        var key = e.key;
        // 处理IE自己调用自己的问题
        if (KEY_ENUMS.GET_SESSION === key || KEY_ENUMS.SYNC_SESSION === key) {
            if (!getSessionStorage(e.newValue) && !isOnlyPage()) {
                return;
            }
        }
        if (KEY_ENUMS.GET_SESSION === key) {
            // 如果需要session,则将session 传过去
            var sessions = beforeSync(getSessions());
            if (sessions) {
                sendSessionStorage(KEY_ENUMS.SYNC_SESSION, JSON.stringify({
                    value: sessions,
                    key: generateUUID()
                }));
            }
        }
        else if (KEY_ENUMS.SYNC_SESSION === key) {
            if (e.newValue) {
                var sessions = JSON.parse(getSessionStorage(e.newValue));
                if (sessions) {
                    sync(sessions.value);
                    if (afterSync) {
                        afterSync(sessions.value);
                    }
                    localStorage.removeItem(KEY_ENUMS.SYNC_SESSION);
                }
            }
        }
    });
    var onbeforeupload = window.onbeforeunload;
    window.onbeforeunload = function (e) {
        localStorage.removeItem(aliveKey);
        localStorage.removeItem(HEARTBEAT_KEY_VALUE);
        if (isOnlyPage()) {
            localStorage.removeItem(KEY_ENUMS.GET_SESSION);
            localStorage.removeItem(KEY_ENUMS.SYNC_SESSION);
        }
        if (onbeforeupload) {
            onbeforeupload.call(window, e);
        }
    };
    exports.default = {
        // 自定义同步方法
        sync: function (callback) {
            if (callback) {
                sync = callback;
            }
        },
        // 同步前，用户可对session进行预处理
        beforeSync: function (callback) {
            if (callback) {
                beforeSync = callback;
            }
        },
        // 同步之后调用
        afterSync: function (callback) {
            afterSync = callback;
        },
        // 触发同步操作
        trigger: function () {
            // 如果当前只打开了一个页签，需要手动触发 afterSync事件
            if (isOnlyPage()) {
                if (afterSync) {
                    afterSync({});
                }
            }
            else {
                sendSessionStorage(KEY_ENUMS.GET_SESSION, generateUUID());
            }
        }
    };
});
