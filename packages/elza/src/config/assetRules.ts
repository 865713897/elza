import Config from '../../compiled/webpack-5-chain';
import { IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  isDev: boolean;
}

export async function addAssetRules(opts: IOpts) {
  const { config, userConfig } = opts;

  const inlineLimit = userConfig.inlineLimit || 10 * 1024;
  const rule = config.module.rule('assets');

  rule
    .oneOf('image')
    .test(/\.(bmp|gif|jpg|jpeg|png)$/)
    .type('asset')
    .parser({
      dataUrlCondition: {
        maxSize: inlineLimit,
      },
    })
    .generator({
      filename: 'static/images/[name].[contenthash:8].[ext]',
    })
    .exclude.add(/node_modules/)
    .end();

  rule
    .oneOf('font')
    .test(/\.(woff|woff2|eot|ttf|otf)$/)
    .type('asset/resource')
    .generator({
      filename: 'static/fonts/[name].[contenthash:8].[ext]',
    })
    .exclude.add(/node_modules/)
    .end();

  rule
    .oneOf('media')
    .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/)
    .type('asset/resource')
    .generator({
      filename: 'static/media/[name].[contenthash:8].[ext]',
    })
    .exclude.add(/node_modules/)
    .end();
}
