import BetterInfoPlugin from 'webpack-plugin-better-info';
import Config from '../../compiled/webpack-5-chain';
import { IConfig } from '../types';

interface IOpts {
  cwd: string;
  config: Config;
  userConfig: IConfig;
}

export async function addBetterInfoPlugin(opts: IOpts) {
  const { config, userConfig } = opts;
  config.plugin('betterInfoPlugin').use(new BetterInfoPlugin(userConfig.betterInfoOption || {}));
}
