export var KEY_ENUMS;
(function (KEY_ENUMS) {
    // 获取session
    KEY_ENUMS["GET_SESSION"] = "__zj_get_session";
    // 同步session
    KEY_ENUMS["SYNC_SESSION"] = "__zj_sync_session";
})(KEY_ENUMS || (KEY_ENUMS = {}));
// 同步方法，可供用户自定义同步的内容
var sync = function (sessions) {
    console.log(sessions);
    Object.entries(sessions).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        sessionStorage.setItem(key, value);
    });
};
// 同步前预处理器，
var beforeSync = function (sessions) {
    return sessions;
};
var afterSync = undefined;
// 获取当前页面的session
var getSessions = function () {
    var sessions = {};
    for (var i = 0, len = sessionStorage.length; i < len; i++) {
        var key = sessionStorage.key(i);
        sessions[key] = sessionStorage.getItem(key);
    }
    return sessions;
};
window.addEventListener('storage', function (e) {
    var key = e.key;
    if (KEY_ENUMS.GET_SESSION === key) {
        // 如果需要session,则将session 传过去
        var sessions = beforeSync(getSessions());
        if (sessions) {
            localStorage.setItem(KEY_ENUMS.SYNC_SESSION, JSON.stringify(sessions));
            // localStorage.removeItem(KEY_ENUMS.SYNC_SESSION)
        }
    }
    else if (KEY_ENUMS.SYNC_SESSION === key) {
        if (e.newValue) {
            var sessions = JSON.parse(e.newValue);
            sync(sessions);
            if (afterSync) {
                afterSync(sessions);
            }
        }
    }
});
export default {
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
        localStorage.setItem(KEY_ENUMS.GET_SESSION, "" + Date.now());
        // localStorage.removeItem(KEY_ENUMS.GET_SESSION)
    }
};
