import AutoRoutesPlugin from 'webpack-plugin-auto-routes';
import Config from '../../compiled/webpack-5-chain';
import { IConfig } from '../types';

interface IOpts {
  cwd: string;
  config: Config;
  userConfig: IConfig;
}

export async function addAutoRoutesPlugin(opts: IOpts) {
  const { config, userConfig } = opts;
  const options = userConfig?.pluginOptions?.['webpack-plugin-auto-routes'] || {};
  config.plugin('auto-routes').use(
    new AutoRoutesPlugin({
      routingMode: 'browser',
      onlyRoutes: true,
      indexPath: '/home',
      ...options,
    }),
  );
}
