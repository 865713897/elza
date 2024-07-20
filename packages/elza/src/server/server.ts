import chalk from "chalk";
import path from "path";
import http from "http";
import express from "express";
import webpack, { Stats, Configuration } from "webpack";
import WebpackDevMiddleware from "webpack-dev-middleware";
import { getDevBanner } from "../utils/getDevBanner";
import { MESSAGE_TYPE } from "../constants";
import { createWebSocketServer } from "./ws";

interface IOpts {
  webpackConfig: Configuration;
  cwd: string;
}

export const createServer = (opts: IOpts) => {
  const { webpackConfig } = opts;
  let ws: ReturnType<typeof createWebSocketServer>;
  const app = express();
  const compiler = webpack({
    ...webpackConfig,
  });

  app.use(WebpackDevMiddleware(compiler, { publicPath: "/", stats: "none" }));

  // hmr
  let stats: any;
  compiler.hooks.invalid.tap("server", () => {
    sendMessage(MESSAGE_TYPE.invalid);
  });
  compiler.hooks.done.tap("server", (_stats: Stats) => {
    stats = _stats;
    sendStats(getStats(stats));
  });

  const sendMessage = (type: string, data?: any, sender?: any) => {
    (sender || ws)?.send(JSON.stringify({ type, data }));
  };

  function sendStats(
    stats: webpack.StatsCompilation,
    force?: boolean,
    sender?: any
  ) {
    const shouldEmit =
      !force &&
      stats &&
      (!stats.errors || stats.errors.length === 0) &&
      (!stats.warnings || stats.warnings.length === 0) &&
      stats.assets &&
      stats.assets.every((asset) => !asset.emitted);
    if (shouldEmit) {
      sendMessage(MESSAGE_TYPE.stillOk, null, sender);
      return;
    }
    sendMessage(MESSAGE_TYPE.hash, stats.hash, sender);
    if (
      (stats.errors && stats.errors.length > 0) ||
      (stats.warnings && stats.warnings.length > 0)
    ) {
      if (stats.warnings && stats.warnings.length > 0) {
        sendMessage(MESSAGE_TYPE.warnings, stats.warnings, sender);
      }
      if (stats.errors && stats.errors.length > 0) {
        sendMessage(MESSAGE_TYPE.errors, stats.errors, sender);
      }
    } else {
      sendMessage(MESSAGE_TYPE.ok, null, sender);
    }
  }

  function getStats(stats: Stats) {
    return stats.toJson({
      all: false,
      hash: true,
      assets: true,
      warnings: true,
      errors: true,
      errorDetails: false,
    });
  }

  app.get("/__elza_ping", (_, res) => {
    res.send("pong");
  });

  app.get("/", (_, res) => {
    res.sendFile(path.resolve(opts.cwd, "public/index.html"));
  });

  const server = http.createServer(app);

  ws = createWebSocketServer(server);

  ws.wss.on("connection", (socket) => {
    if (stats) {
      sendStats(getStats(stats), false, socket);
    }
  });

  server.listen(3000, () => {
    const { before, main, after } = getDevBanner();
    console.log(before);
    console.log(`${chalk.green("ready")} - ${main}`);
    console.log(after);
  });
};
