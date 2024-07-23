import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Config from '../../compiled/webpack-5-chain';
import { IConfig } from '../types';

interface IOpts {
  cwd: string;
  config: Config;
  userConfig: IConfig;
  isDev: boolean;
}

export async function addMiniCssExtractPlugin(opts: IOpts) {
  const { config, isDev } = opts;
  if (!isDev) {
    config.plugin('mini-css-extract-plugin').use(
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].css',
      }),
    );
  }
}
