import http from 'http';
import express from 'express';
import cors from 'cors';
import path from 'path';
import webpack, { Stats, Configuration } from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import ConnectHistoryApiFallback from 'connect-history-api-fallback';
import { getDevBanner } from '../utils/getDevBanner';
import logger from '../utils/logger';
import { MESSAGE_TYPE } from '../constants';
import { createWebSocketServer } from './ws';
import { IConfig } from '../types';

interface IOpts {
  webpackConfig: Configuration;
  cwd: string;
  userConfig: IConfig;
  port?: number;
}

export const createServer = async (opts: IOpts) => {
  const { webpackConfig, userConfig } = opts;
  let ws: ReturnType<typeof createWebSocketServer>;
  const app = express();
  const cacheDir = path.resolve(opts.cwd, 'node_modules/.elza/cache');
  const compiler = webpack(webpackConfig);

  app.use(
    cors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
      credentials: true,
    }),
  );

  app.use(
    WebpackDevMiddleware(compiler, {
      publicPath: userConfig.publicPath || '/',
      writeToDisk: userConfig.writeToDisk,
      stats: 'none',
    }),
  );

  // TODO: 解决history模式下404问题
  app.use(ConnectHistoryApiFallback({ index: '/' }));

  // SPA 路由处理
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/static')) {
      const fs = compiler.outputFileSystem;
      const filePath = path.join(compiler.outputPath, 'index.html');
      fs.readFile(filePath, (err, file) => {
        if (err) {
          next(err);
        } else {
          res.set('content-type', 'text/html');
          res.send(file);
        }
      });
    } else {
      next();
    }
  });

  app.use('/__elza_ping', (_, res) => {
    res.send('pong');
  });

  // hmr
  let stats: any;
  compiler.hooks.invalid.tap('server', () => {
    sendMessage(MESSAGE_TYPE.invalid);
  });
  compiler.hooks.done.tap('server', (_stats: Stats) => {
    stats = _stats;
    sendStats(getStats(stats));
  });

  const sendMessage = (type: string, data?: any, sender?: any) => {
    (sender || ws)?.send(JSON.stringify({ type, data }));
  };

  function sendStats(stats: webpack.StatsCompilation, force?: boolean, sender?: any) {
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

  const server = http.createServer(app);

  ws = createWebSocketServer(server);
  ws.wss.on('connection', (socket) => {
    if (stats) {
      sendStats(getStats(stats), false, socket);
    }
  });

  const port = opts.port || 3000;
  server.listen(port, () => {
    const { before, main, after } = getDevBanner({ port });
    console.log(before);
    logger.ready(main);
    console.log(after);
  });

  process.on('SIGINT', () => {
    server.close();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    server.close();
    process.exit(1);
  });
};
