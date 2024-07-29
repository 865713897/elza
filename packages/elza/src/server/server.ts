import express from 'express';
import { resolve, join } from 'path';
import { writeFileSync } from 'fs';
import esbuild from 'esbuild';
import { externalGlobalPlugin } from 'esbuild-plugin-external-global';

interface IOpts {
  cwd: string;
}

export async function createServer(opts: IOpts) {
  const server = express();

  await precompile(opts.cwd);
  // 用于存储构建结果的变量
  let buildResult: any = await esbuildServer(opts);

  // 中间件，提供内存中的构建结果
  server.use((req, res, next) => {
    if (buildResult) {
      const filePath = join('dist', req.path);
      const file = buildResult.outputFiles.find((file: any) => file.path.endsWith(filePath));
      if (file) {
        res.set('Content-Type', getContentType(filePath));
        res.send(Buffer.from(file.contents));
        return;
      }
    }
    next();
  });

  // server.use('/vender', express.static(resolve(opts.cwd, './node_modules/.elza/vender')));
  server.get('/', (_req, res) => {
    res.set('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test</title>
    <script src="https://unpkg.com/react@17.0.2/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@17.0.2/umd/react-dom.development.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script defer src="/index.js"></script>
  </body>
</html>
`);
  });
  server.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

async function esbuildServer(opts: IOpts) {
  const start = new Date().getTime();
  const context = await esbuild.build({
    entryPoints: [resolve(opts.cwd, 'src/index.jsx')],
    bundle: true,
    write: false,
    platform: 'browser',
    outdir: 'dist',
    format: 'cjs',
    external: ['react', 'react-dom'],
    // banner: {
    //   js: 'var require = createRequire(import.meta.url)',
    // },
    plugins: [
      // externalGlobalPlugin({
      //   react: 'window.React',
      //   'react-dom': 'window.ReactDOM',
      // }),
    ],
  });
  console.log(new Date().getTime() - start, 'end');
  // console.log(context, 'context');
  return context;
}

async function precompile(cwd: string) {
  const dependencies = [
    'react',
    // 'react-dom',
    // 添加其他需要预编译的依赖包
  ];
  await esbuild
    .build({
      entryPoints: dependencies,
      bundle: true,
      minify: true,
      sourcemap: true,
      globalName: 'React',
      format: 'iife',
      platform: 'browser',
      outdir: join(cwd, 'node_modules/.elza', 'vender'),
    })
    .catch(() => process.exit(1));

  const moduleMap = dependencies.reduce((map, dep) => {
    map[dep] = `${cwd}/node_modules/.elza/vender/${dep}.js`;
    return map;
  }, {});

  writeFileSync(
    join(cwd, 'node_modules/.elza', 'moduleMap.json'),
    JSON.stringify(moduleMap, null, 2),
  );
}

// 根据文件扩展名设置适当的内容类型
function getContentType(filePath: string) {
  if (filePath.endsWith('.js')) return 'application/javascript';
  if (filePath.endsWith('.css')) return 'text/css';
  if (filePath.endsWith('.html')) return 'text/html';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  return 'text/plain';
}
