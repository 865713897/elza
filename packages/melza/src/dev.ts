import express from 'express';
import esbuild from 'esbuild';
import portfinder from 'portfinder';
import type { ServeOnRequestArgs } from 'esbuild';
import path from 'path';
import {
  DEFAULT_ENTRY_POINT,
  DEFAULT_OUTDIR,
  DEFAULT_PLATFORM,
  DEFAULT_PORT,
  DEFAULT_HOST,
  DEFAULT_BUILD_PORT,
} from './constants';

export const dev = async () => {
  const cwd = process.cwd();
  const target = 'chrome100,firefox100,safari15'.split(',');
  const port = await portfinder.getPortPromise({
    port: DEFAULT_PORT,
  });

  const app = express();
  const esbuildOutput = path.resolve(cwd, DEFAULT_OUTDIR);
  app.use(`/${DEFAULT_OUTDIR}`, express.static(esbuildOutput));
  app.get('/', (_req: any, res: any) => {
    res.set('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <title>melza</title>
        </head>
        
        <body>
            <div id="root">
                <span>loading...</span>
            </div>
            <script src="/${DEFAULT_OUTDIR}/index.js"></script>
        </body>
        </html>`);
  });
  app.listen(port, async () => {
    console.log(`App listening at http://127.0.0.1:${port}`);
    try {
      const buildJS = await esbuild.context({
        entryPoints: [path.resolve(cwd, DEFAULT_ENTRY_POINT)],
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
