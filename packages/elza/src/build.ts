import webpack from 'webpack';
import { generateGradientContent } from './utils/generateGradientColor';
import logger from './utils/logger';
import { getConfig, getUserConfig } from './config/config';
import { Env } from './types';

interface IOpts {
  cwd: string;
  entry: string;
}

export async function build(opts: IOpts) {
  const title = generateGradientContent('elza v1.0.0', ['#94FFEB', '#00A97B']);
  logger.title(title);
  const userConfig = await getUserConfig(opts.cwd);
  const webpackConfig = await getConfig({
    cwd: opts.cwd,
    entry: opts.entry,
    env: Env.production,
    hmr: false,
    userConfig,
  });

  const compiler = webpack({
    ...webpackConfig,
  });

  compiler.run(() => {
    compiler.close(() => {});
  });
}
