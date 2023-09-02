import express from 'express';
import fs from 'fs';
import esbuild from 'esbuild';
import portfinder from 'portfinder';
import path from 'path';
import { getAppData, getRoutes } from './appData';
import { getUserConfig } from './userConfig';
import { generateEntry, generateHtml, generateRoutes } from './generate';
import { DEFAULT_ENTRY_POINT, DEFAULT_OUTDIR, DEFAULT_PORT } from './constants';

export const dev = async () => {
  const cwd = process.cwd();
  const output = path.resolve(cwd, DEFAULT_OUTDIR);
  const target = 'chrome100,firefox100,safari15'.split(',');
  const port = await portfinder.getPortPromise({
    port: DEFAULT_PORT,
  });

  const app = express();
  const esbuildOutput = path.resolve(cwd, DEFAULT_OUTDIR);
  app.use(`/${DEFAULT_OUTDIR}`, express.static(esbuildOutput));
  app.get('/', (_req: any, res: any, next: (err?: Error) => void) => {
    res.set('Content-Type', 'text/html');
    const htmlPath = path.join(output, 'index.html');
    if (fs.existsSync(htmlPath)) {
      fs.createReadStream(htmlPath).on('error', next).pipe(res);
    } else {
      next();
    }
  });
  app.listen(port, async () => {
    console.log(`App listening at http://127.0.0.1:${port}`);
    // 生命周期
    // 获取元数据
    const appData = await getAppData({ cwd });
    // 获取routes配置
    const routes = await getRoutes({ appData });
    // 获取用户配置
    const userConfig = await getUserConfig({ appData });
    // 生产路由文件
    await generateRoutes({ appData, routes });
    // 生成入口文件
    await generateEntry({ appData, userConfig });
    // 生成入口页面
    await generateHtml({ appData, userConfig });
    try {
      const buildJS = await esbuild.context({
        entryPoints: [path.resolve(cwd, DEFAULT_ENTRY_POINT)],
        external: ['prettier'],
        format: 'esm',
        bundle: true,
        target,
        logLevel: 'error',
        outdir: DEFAULT_OUTDIR,
      });
      await buildJS.watch();
    } catch (error) {}
  });
};
