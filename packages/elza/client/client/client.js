"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
// 获取host
function getSocketUrl() {
    const url = location;
    const host = url.host;
    const isHttps = url.protocol === 'https:';
    return `${isHttps ? 'wss' : 'ws'}://${host}`;
}
function getPingUrl() {
    const url = location;
    return `${url.protocol}//${url.host}/__elza_ping`;
}
console.log('[webpack] connecting...');
if ('WebSocket' in window) {
    const socket = new WebSocket(getSocketUrl(), 'elza-hmr');
    let pingTimer = null;
    let pingUrl = getPingUrl();
    let isFirstCompilation = true;
    let mostRecentCompilationHash;
    socket.addEventListener('message', ({ data }) => {
        let payload = JSON.parse(data);
        if (payload.type === 'connected') {
            console.log('[webpack] connected.');
            pingTimer = setInterval(() => socket.send('ping'), 30000);
        }
        else {
            handleMessage(payload);
        }
    });
    async function waitForSuccessfulPing(ms = 1000) {
        while (true) {
            try {
                await fetch(pingUrl);
                break;
            }
            catch (error) {
                await new Promise((resolve) => setTimeout(resolve, ms));
            }
        }
    }
    socket.addEventListener('close', async () => {
        if (pingTimer)
            clearInterval(pingTimer);
        console.info('[webpack] Dev server disconnected. Polling for restart...');
        await waitForSuccessfulPing();
        location.reload();
    });
    // 处理消息
    function handleMessage(payload) {
        switch (payload.type) {
            case constants_1.MESSAGE_TYPE.stillOk:
            case constants_1.MESSAGE_TYPE.ok:
                handleSuccess();
                break;
            case constants_1.MESSAGE_TYPE.hash:
                handleAvailableHash(payload.data);
                break;
            default:
                break;
        }
    }
    // 更新成功
    function handleSuccess() {
        const isHotUpdate = !isFirstCompilation;
        isFirstCompilation = false;
        if (isHotUpdate) {
            tryApplyUpdates();
        }
    }
    function handleAvailableHash(hash) {
        mostRecentCompilationHash = hash;
    }
    function isUpdateAvailable() {
        // @ts-ignore
        return mostRecentCompilationHash !== __webpack_hash__;
    }
    function canApplyUpdates() {
        // @ts-ignore
        return module.hot.status() === 'idle';
    }
    // 尝试应用更新
    function tryApplyUpdates() {
        // @ts-ignore
        if (!module.hot) {
            window.location.reload();
            return;
        }
        if (!isUpdateAvailable() || !canApplyUpdates()) {
            return;
        }
        function handleApplyUpdates(err, updatedModules) {
            const needsForcedReload = !err && !updatedModules;
            const hasErrors = err;
            if (needsForcedReload || (hasErrors && !canApplyUpdates())) {
                window.location.reload();
            }
        }
        // @ts-ignore
        module.hot
            .check(/* autoApply */ true)
            .then((updatedModules) => {
            handleApplyUpdates(null, updatedModules);
        })
            .catch((err) => {
            handleApplyUpdates(err, null);
        });
    }
}
