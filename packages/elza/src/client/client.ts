import stripAnsi from 'strip-ansi';
import * as ErrorOverlay from 'react-error-overlay';
import { MESSAGE_TYPE } from '../constants';
import { formatWebpackMessages } from '../utils/formatWebpackMessages';

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
  let pingTimer: NodeJS.Timeout | null = null;
  let pingUrl = getPingUrl();
  let isFirstCompilation = true;
  let hasCompileErrors = false;
  let hasRuntimeError = false;
  let mostRecentCompilationHash: string;

  socket.addEventListener('message', ({ data }) => {
    let payload = JSON.parse(data);
    if (payload.type === 'connected') {
      console.log('[webpack] connected.');
      pingTimer = setInterval(() => socket.send('ping'), 30000);
    } else {
      handleMessage(payload);
    }
  });

  async function waitForSuccessfulPing(ms = 1000) {
    while (true) {
      try {
        await fetch(pingUrl);
        break;
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, ms));
      }
    }
  }

  socket.addEventListener('close', async () => {
    if (pingTimer) clearInterval(pingTimer);
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
  function handleMessage(payload: any) {
    switch (payload.type) {
      case MESSAGE_TYPE.stillOk:
      case MESSAGE_TYPE.ok:
        handleSuccess();
        break;
      case MESSAGE_TYPE.hash:
        handleAvailableHash(payload.data);
        break;
      case MESSAGE_TYPE.errors:
        handleErrors(payload.data);
        break;
      case MESSAGE_TYPE.warnings:
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

  function handleWarnings(warnings: string[]) {
    const isHotUpdate = !isFirstCompilation;
    isFirstCompilation = false;
    hasCompileErrors = true;
    const formatted = formatWebpackMessages({
      warnings,
      errors: [],
    });

    // print warnings
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
      for (let i = 0; i < formatted.warnings.length; i++) {
        if (i === 5) {
          console.warn(
            'There were more warnings in other files.\n' +
              'You can find a complete log in the terminal.',
          );
          break;
        }
        console.warn(stripAnsi(formatted.warnings[i]));
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

  function handleErrors(errors: string[]) {
    isFirstCompilation = false;
    hasCompileErrors = true;
    const formatted = formatWebpackMessages({
      warnings: [],
      errors,
    });
    ErrorOverlay.reportBuildError(formatted.errors[0]);
    // Also log them to the console.
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      for (let i = 0; i < formatted.errors.length; i++) {
        console.error(stripAnsi(formatted.errors[i]));
      }
    }
  }

  function handleAvailableHash(hash: string) {
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
  function tryApplyUpdates(onHotUpdateSuccess?: Function) {
    // @ts-ignore
    if (!module.hot) {
      window.location.reload();
      return;
    }

    if (!isUpdateAvailable() || !canApplyUpdates()) {
      return;
    }

    function handleApplyUpdates(err: Error | null, updatedModules: any) {
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
      .then((updatedModules: any) => {
        handleApplyUpdates(null, updatedModules);
      })
      .catch((err: Error) => {
        handleApplyUpdates(err, null);
      });
  }
}
