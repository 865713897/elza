import { DefinePlugin } from 'webpack';
import Config from '../../compiled/webpack-5-chain';
import { IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
}

const ENV_SHOULD_PASS = ['NODE_ENV', 'ERROR_OVERLAY'];

function resolveDefine(opts: IOpts) {
  const { userConfig } = opts;
  const env: Record<string, any> = {};
  ENV_SHOULD_PASS.forEach((key) => {
    const envVal = process.env[key];
    if (typeof envVal === 'undefined') return;
    env[key] = envVal;
  });

  env.PUBLIC_PATH = userConfig.publicPath || '/';

  for (const key in env) {
    env[key] = JSON.stringify(env[key]);
  }

  const define: Record<string, any> = {};
  if (userConfig.define) {
    for (const key in userConfig.define) {
      define[key] = JSON.stringify(userConfig.define[key]);
    }
  }

  return {
    'process.env': env,
    ...define,
  };
}

export async function addDefinePlugin(opts: IOpts) {
  const { config } = opts;
  config.plugin('define').use(DefinePlugin, [resolveDefine(opts)]);
}
