import Config from '../../compiled/webpack-5-chain';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { IConfig, JSMinifier, CSSMinifier } from '../types';

interface IOpts {
  cwd: string;
  config: Config;
  userConfig: IConfig;
  isDev: boolean;
}

export async function addCompressPlugin(opts: IOpts) {
  const { config, userConfig, isDev } = opts;
  const jsMinifier = userConfig.jsMinifier || JSMinifier.swc;
  const cssMinifier = userConfig.cssMinifier || CSSMinifier.cssnano;

  if (isDev) {
    config.optimization.minimize(false);
    return;
  }
  config.optimization.minimize(true);

  let minify: any;
  let terserOptions: { [key: string]: any };
  if (jsMinifier === JSMinifier.esbuild) {
    minify = TerserPlugin.esbuildMinify;
    terserOptions = {
      target: ['es2015'],
      legalComments: false,
    };
  } else if (jsMinifier === JSMinifier.swc) {
    minify = TerserPlugin.swcMinify;
  } else if (jsMinifier === JSMinifier.terser) {
    minify = TerserPlugin.terserMinify;
    terserOptions = {
      format: {
        comments: false,
      },
    };
  } else if (jsMinifier !== JSMinifier.none) {
    throw new Error(`Unsupported js minifier: ${jsMinifier}`);
  }
  config.optimization.minimizer(`js-${jsMinifier}`).use(TerserPlugin, [{ minify, terserOptions }]);

  let cssMinify: any;
  let minimizerOptions: { [key: string]: any };
  if (cssMinifier === CSSMinifier.esbuild) {
    cssMinify = CssMinimizerPlugin.esbuildMinify;
    minimizerOptions = { target: ['es2015'] };
  } else if (cssMinifier === CSSMinifier.cssnano) {
    cssMinify = CssMinimizerPlugin.cssnanoMinify;
  } else if (cssMinifier !== CSSMinifier.none) {
    throw new Error(`Unsupported css minifier: ${cssMinifier}`);
  }
  config.optimization.minimizer(`css-${cssMinifier}`).use(CssMinimizerPlugin, [
    {
      minify: cssMinify,
      minimizerOptions,
    },
  ]);
}
