import webpack, { Configuration } from 'webpack';
import { resolve, join } from 'path';
import { build } from 'esbuild';
import BetterInfo from 'webpack-plugin-better-info';
import { tryPaths } from '../utils/tryPath';
import { getValidPaths } from '../utils/getValidPaths';
import { DEFAULT_OUTPUT_PATH } from '../constants';
import { Env, IConfig } from '../types';

import { addJavascriptRules } from './jsRules';
import { addCssRules } from './cssRules';

import { addHtmlWebpackPlugin } from './htmlWebpackPlugin';
import { addMiniCssExtractPlugin } from './miniCssExtractPlugin';
import { addAutoRoutesPlugin } from './autoRoutesPlugin';

interface IOpts {
  cwd: string;
  env: Env;
  entry: string;
  hmr: boolean;
  userConfig: IConfig;
}

export async function getConfig(opts: IOpts) {
  const { userConfig } = opts;
  const isDev = opts.env === Env.development;
  const config: Configuration = {};

  const applyOpts = {
    config,
    userConfig,
    cwd: opts.cwd,
    isDev,
  };

  // mode
  config.mode = isDev ? 'development' : 'production';
  config.stats = 'none';

  // entry
  config.entry = [opts.entry];
  if (isDev && opts.hmr) {
    config.entry.unshift(require.resolve('../../client/client/client.js'));
  }

  // devtool
  config.devtool = isDev ? userConfig.devtool || 'eval-source-map' : false;

  // output
  const filename = isDev ? '[name].js' : 'static/js/[name].[contenthash:8].js';
  const absOutputPath = resolve(opts.cwd, DEFAULT_OUTPUT_PATH);
  config.output = { filename, path: absOutputPath, clean: true };

  // resolve
  config.resolve = {
    symlinks: true,
    modules: ['node_modules'],
    alias: {
      '@/': join(opts.cwd, 'src/'),
      '@components': join(opts.cwd, 'src/components/'),
      ...(userConfig.alias || {}),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.cjs', '.mjs', '.json', '.wasm'],
  };

  // externals
  config.externals = userConfig.externals || {};

  // target
  config.target = ['web', 'es5'];

  // cache
  config.cache = {
    type: 'filesystem',
    buildDependencies: {
      config: getValidPaths([
        join(opts.cwd, 'elza.config.js'),
        join(opts.cwd, 'elza.config.ts'),
        join(opts.cwd, 'package.json'),
      ]),
    },
    cacheDirectory: join(opts.cwd, 'node_modules/.elza/cache'),
  };

  // rules
  config.module = { rules: [] };
  await addJavascriptRules(applyOpts);
  await addCssRules(applyOpts);

  // plugins
  config.plugins = [];
  config.plugins?.push(new webpack.HotModuleReplacementPlugin());
  config.plugins?.push(new BetterInfo({}));
  await addHtmlWebpackPlugin(applyOpts);
  await addMiniCssExtractPlugin(applyOpts);
  await addAutoRoutesPlugin(applyOpts);

  return config;
}

export async function getUserConfig(cwd: string): Promise<IConfig> {
  const configFile = tryPaths([join(cwd, 'elza.config.js'), join(cwd, 'elza.config.ts')]);
  let config = {};
  const outputPath = resolve(cwd, 'node_modules/.elza/elza.config.js');
  if (configFile) {
    await build({
      entryPoints: [configFile],
      outfile: outputPath,
      bundle: true,
      format: 'cjs',
      sourcemap: false,
      platform: 'node',
    });
    config = require(outputPath).default;
    config = resolveConfig(config, cwd);
  }

  return config;
}

function resolveConfig(config: IConfig, cwd: string) {
  const { htmlTemplate } = config;
  if (htmlTemplate) {
    config.htmlTemplate = config.htmlTemplate?.replace(resolve(cwd, 'node_modules/.elza'), '');
  }
  return config;
}
