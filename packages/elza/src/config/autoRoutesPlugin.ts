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
  config.plugin('auto-routes').use(
    new AutoRoutesPlugin({
      routingMode: 'hash',
      onlyRoutes: true,
      indexPath: '/home',
      ...(userConfig.autoRoutesOption || {}),
    }),
  );
}
