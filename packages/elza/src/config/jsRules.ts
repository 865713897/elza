import { Configuration } from 'webpack';
import { IConfig, Transpiler } from '../types';

interface IOpts {
  config: Configuration;
  userConfig: IConfig;
  cwd: string;
}

export async function addJavascriptRules(opts: IOpts) {
  const { config, userConfig } = opts;
  const rules = [{ test: /\.(j|t)sx?$/, exclude: /node_modules/ }];

  const transpiler = userConfig.transpiler || Transpiler.babel;

  rules.forEach((rule) => {
    if (transpiler === Transpiler.babel) {
      config.module?.rules?.push({
        ...rule,
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [require.resolve('@babel/preset-env'), require.resolve('@babel/preset-react')],
            plugins: [require.resolve('babel-plugin-auto-css-module')],
          },
        },
      });
    } else if (transpiler === Transpiler.swc) {
      config.module?.rules?.push({
        ...rule,
        use: {
          loader: require.resolve('swc-loader'),
          options: {
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
          },
        },
      });
    }
  });
}
