import { getConfig, getUserConfig } from './config/config';
import { generateGradientContent } from './utils/generateGradientColor';
import logger from './utils/logger';
import { getVersion } from './utils/utils';
import { Env } from './types';
import { createServer } from './server/server';

interface IOpts {
  cwd: string;
  entry: string;
}

export async function dev(opts: IOpts) {
  const version = getVersion();
  const title = generateGradientContent(`elza v${version}`, ['#94FFEB', '#00A97B']);
  logger.title(title);
  const userConfig = await getUserConfig(opts.cwd);
  const webpackConfig = await getConfig({
    cwd: opts.cwd,
    entry: opts.entry,
    env: Env.development,
    hmr: true,
    userConfig,
  });
  await createServer({ webpackConfig, cwd: opts.cwd, userConfig });
}
