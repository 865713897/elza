import webpack from 'webpack';
import Config from '../../compiled/webpack-5-chain';
import { IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
}

export async function addDefinePlugin(opts: IOpts) {
  const { config, userConfig } = opts;
  config.plugin('define').use(webpack.DefinePlugin, [
    {
      'process.env': {
        ...userConfig.env,
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    },
  ]);
}
