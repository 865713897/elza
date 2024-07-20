"use strict";

// src/client/client.ts
function getSocketUrl() {
  const url = location;
  const host = url.host;
  const isHttps = url.protocol === "https:";
  return `${isHttps ? "wss" : "ws"}://${host}`;
}
function getPingUrl() {
  const url = location;
  return `${url.protocol}//${url.host}/__elza_ping`;
}
if ("WebSocket" in window) {
  let handleMessage = function(payload) {
    switch (payload.type) {
      case "still-ok" /* stillOk */:
      case "ok" /* ok */:
        handleSuccess();
        break;
      case "hash" /* hash */:
        handleAvailableHash(payload.data);
        break;
      default:
        break;
    }
  }, handleSuccess = function() {
    const isHotUpdate = !isFirstCompilation;
    isFirstCompilation = false;
    if (isHotUpdate) {
      tryApplyUpdates();
    }
  }, handleAvailableHash = function(hash) {
    mostRecentCompilationHash = hash;
  }, isUpdateAvailable = function() {
    return mostRecentCompilationHash !== __webpack_hash__;
  }, canApplyUpdates = function() {
    return module.hot.status() === "idle";
  }, tryApplyUpdates = function() {
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
      if (needsForcedReload || hasErrors && !canApplyUpdates()) {
        window.location.reload();
      }
    }
    module.hot.check(
      /* autoApply */
      true
    ).then((updatedModules) => {
      handleApplyUpdates(null, updatedModules);
    }).catch((err) => {
      handleApplyUpdates(err, null);
    });
  };
  handleMessage2 = handleMessage, handleSuccess2 = handleSuccess, handleAvailableHash2 = handleAvailableHash, isUpdateAvailable2 = isUpdateAvailable, canApplyUpdates2 = canApplyUpdates, tryApplyUpdates2 = tryApplyUpdates;
  const socket = new WebSocket(getSocketUrl(), "elza-hmr");
  let pingTimer = null;
  let pingUrl = getPingUrl();
  let isFirstCompilation = true;
  let mostRecentCompilationHash;
  socket.addEventListener("message", ({ data }) => {
    let payload = JSON.parse(data);
    if (payload.type === "connected") {
      console.log("[webpack] connected.");
      pingTimer = setInterval(() => socket.send("ping"), 3e4);
    } else {
      handleMessage(payload);
    }
  });
  async function waitForSuccessfulPing(ms = 1e3) {
    while (true) {
      try {
        await fetch(pingUrl);
        break;
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, ms));
      }
    }
  }
  socket.addEventListener("close", async () => {
    if (pingTimer) clearInterval(pingTimer);
    console.info("[webpack] Dev server disconnected. Polling for restart...");
    await waitForSuccessfulPing();
    window.location.reload();
  });
}
var handleMessage2;
var handleSuccess2;
var handleAvailableHash2;
var isUpdateAvailable2;
var canApplyUpdates2;
var tryApplyUpdates2;
