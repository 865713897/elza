import AutoRoutesPlugin from 'webpack-plugin-auto-routes';
import { Configuration } from 'webpack';
import { IConfig } from '../types';

interface IOpts {
  cwd: string;
  config: Configuration;
  userConfig: IConfig;
}

export async function addAutoRoutesPlugin(opts: IOpts) {
  const { config, userConfig } = opts;
  const options = userConfig?.pluginOptions?.['webpack-plugin-auto-routes'] || {};
  config.plugins?.push(
    new AutoRoutesPlugin({
      routingMode: 'browser',
      onlyRoutes: true,
      indexPath: '/home',
      ...options,
    }),
  );
}
