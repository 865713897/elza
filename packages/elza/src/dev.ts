import esbuild from 'esbuild';
import path from 'path';
import { writeFileSync } from 'fs';
import { getConfig, getUserConfig } from './config/config';
import { generateGradientContent } from './utils/generateGradientColor';
import logger from './utils/logger';
import { Env } from './types';
import { createServer } from './server/server';

interface IOpts {
  cwd: string;
  entry: string;
}

export async function dev(opts: IOpts) {
  const title = generateGradientContent('elza v1.0.0', ['#94FFEB', '#00A97B']);
  logger.title(title);
  const userConfig = await getUserConfig(opts.cwd);
  const webpackConfig = await getConfig({
    cwd: opts.cwd,
    entry: opts.entry,
    env: Env.development,
    hmr: true,
    userConfig,
  });

  createServer({ webpackConfig, cwd: opts.cwd, userConfig });
}

// 启动之前进行依赖预编译
export async function precompile(opts: IOpts) {
  const dependencies = [
    'react',
    'react-dom',
    // 添加其他需要预编译的依赖包
  ];

  await esbuild
    .build({
      entryPoints: dependencies,
      bundle: true,
      minify: true,
      sourcemap: true,
      format: 'cjs',
      platform: 'node',
      outdir: path.join(opts.cwd, 'node_modules/.elza', 'vender'),
    })
    .catch(() => process.exit(1));

  const moduleMap = dependencies.reduce((map, dep) => {
    map[dep] = `${opts.cwd}/node_modules/.elza/vender/${dep}.js`;
    return map;
  }, {});

  writeFileSync(
    path.join(opts.cwd, 'node_modules/.elza', 'moduleMap.json'),
    JSON.stringify(moduleMap, null, 2),
  );
}
