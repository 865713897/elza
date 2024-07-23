import Config from '../../compiled/webpack-5-chain';
import { IConfig, Transpiler } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
}

export async function addJavascriptRules(opts: IOpts) {
  const { config, userConfig } = opts;
  const rules = [
    config.module
      .rule('j|tsx')
      .test(/\.(j|t)sx?$/)
      .exclude.add(/node_modules/)
      .end(),
  ];

  const transpiler = userConfig.transpiler || Transpiler.babel;

  rules.forEach((rule) => {
    if (transpiler === Transpiler.babel) {
      rule
        .use('babel-loader')
        .loader(require.resolve('babel-loader'))
        .options({
          presets: [require.resolve('@babel/preset-env'), require.resolve('@babel/preset-react')],
          plugins: [require.resolve('babel-plugin-auto-css-module')],
        });
    } else if (transpiler === Transpiler.swc) {
      rule
        .use('swc-loader')
        .loader(require.resolve('swc-loader'))
        .options({
          jsc: {
            parser: {
              syntax: 'ecmascript',
              jsx: true,
              decorators: false,
              dynamicImport: true,
            },
            experimental: {
              plugins: [[require.resolve('swc-plugin-auto-css-module'), {}]],
            },
            preserveAllComments: true,
            target: 'es2015',
          },
          minify: true,
        });
    }
  });
}
