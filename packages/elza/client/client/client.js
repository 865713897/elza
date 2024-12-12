"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const ErrorOverlay = __importStar(require("react-error-overlay"));
const constants_1 = require("../constants");
const formatWebpackMessages_1 = require("../utils/formatWebpackMessages");
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
    let hasCompileErrors = false;
    let hasRuntimeError = false;
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
    ErrorOverlay.startReportingRuntimeErrors({
        onError: function () {
            hasRuntimeError = true;
        },
        filename: '/static/js/main.js',
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
            case constants_1.MESSAGE_TYPE.errors:
                handleErrors(payload.data);
                break;
            case constants_1.MESSAGE_TYPE.warnings:
                handleWarnings(payload.data);
                break;
            default:
                break;
        }
    }
    // 更新成功
    function handleSuccess() {
        const isHotUpdate = !isFirstCompilation;
        isFirstCompilation = false;
        hasCompileErrors = false;
        if (isHotUpdate) {
            tryApplyUpdates(() => tryDismissErrorOverlay());
        }
    }
    function handleWarnings(warnings) {
        const isHotUpdate = !isFirstCompilation;
        isFirstCompilation = false;
        hasCompileErrors = true;
        const formatted = (0, formatWebpackMessages_1.formatWebpackMessages)({
            warnings,
            errors: [],
        });
        // print warnings
        if (typeof console !== 'undefined' && typeof console.warn === 'function') {
            for (let i = 0; i < formatted.warnings.length; i++) {
                if (i === 5) {
                    console.warn('There were more warnings in other files.\n' +
                        'You can find a complete log in the terminal.');
                    break;
                }
                console.warn((0, strip_ansi_1.default)(formatted.warnings[i]));
            }
        }
        // Attempt to apply hot updates or reload.
        if (isHotUpdate) {
            tryApplyUpdates(function onSuccessfulHotUpdate() {
                // Only dismiss it when we're sure it's a hot update.
                // Otherwise, it would flicker right before the reload.
                tryDismissErrorOverlay();
            });
        }
    }
    function handleErrors(errors) {
        isFirstCompilation = false;
        hasCompileErrors = true;
        const formatted = (0, formatWebpackMessages_1.formatWebpackMessages)({
            warnings: [],
            errors,
        });
        ErrorOverlay.reportBuildError(formatted.errors[0]);
        // Also log them to the console.
        if (typeof console !== 'undefined' && typeof console.error === 'function') {
            for (let i = 0; i < formatted.errors.length; i++) {
                console.error((0, strip_ansi_1.default)(formatted.errors[i]));
            }
        }
    }
    function handleAvailableHash(hash) {
        mostRecentCompilationHash = hash;
    }
    function tryDismissErrorOverlay() {
        if (!hasCompileErrors) {
            ErrorOverlay.dismissBuildError();
        }
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
    function tryApplyUpdates(onHotUpdateSuccess) {
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
            const hasErrors = err || hasRuntimeError;
            if (needsForcedReload || hasErrors) {
                window.location.reload();
            }
            if (onHotUpdateSuccess) {
                onHotUpdateSuccess();
            }
            if (isUpdateAvailable()) {
                tryApplyUpdates();
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
