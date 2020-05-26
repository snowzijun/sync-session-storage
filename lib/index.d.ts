declare type SESSION_RESULT = {
    [key: string]: string | null;
};
declare type SYNC_TYPE = (sessions: SESSION_RESULT) => void;
declare type BEFORE_SYNC_TYPE = (sessions: SESSION_RESULT) => SESSION_RESULT;
declare type AFTER_SYNC_TYPE = (sessions: SESSION_RESULT) => void;
declare const _default: {
    sync: (callback: SYNC_TYPE | undefined) => void;
    beforeSync: (callback: BEFORE_SYNC_TYPE | undefined) => void;
    afterSync: (callback: AFTER_SYNC_TYPE) => void;
    trigger: () => void;
};
export default _default;
