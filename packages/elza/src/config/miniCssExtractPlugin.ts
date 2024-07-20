import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { Configuration } from 'webpack';
import { IConfig } from '../types';

interface IOpts {
  cwd: string;
  config: Configuration;
  userConfig: IConfig;
  isDev: boolean;
}

export async function addMiniCssExtractPlugin(opts: IOpts) {
  const { config, isDev } = opts;
  
  if (!isDev) {
    config.plugins?.push(
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].css',
      }),
    );
  }
}
