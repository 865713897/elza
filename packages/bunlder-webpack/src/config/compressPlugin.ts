import Config from '../../compiled/webpack-5-chain';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { IConfig } from '../types';

interface IOpts {
  cwd: string;
  config: Config;
  userConfig: IConfig;
  isDev: boolean;
}

export function addCompressPlugin(opts: IOpts) {
  const { config, userConfig, isDev } = opts;
  if (isDev) {
    config.optimization.minimize(false);
    return;
  }
  config.optimization.minimize(true);

  let minify: any;
  let terserOptions: { [key: string]: any };
  minify = TerserPlugin.esbuildMinify;
  terserOptions = {
    target: ['es2015'],
    legalComments: false,
  };
  config.optimization.minimizer(`js-esbuild`).use(TerserPlugin, [{ minify, terserOptions }]);

  let cssMinify: any;
  let minimizerOptions: { [key: string]: any };
  cssMinify = CssMinimizerPlugin.esbuildMinify;
  minimizerOptions = { target: ['es2015'] };
  config.optimization.minimizer(`css-esbuild`).use(CssMinimizerPlugin, [
    {
      minify: cssMinify,
      minimizerOptions,
    },
  ]);
}
