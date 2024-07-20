import webpack, { Configuration } from 'webpack';
import { resolve, join } from 'path';
import { build } from 'esbuild';
import BetterInfo from 'webpack-plugin-better-info';
import { tryPaths } from '../utils/tryPath';
import { DEFAULT_OUTPUT_PATH } from '../constants';
import { Env, IConfig } from '../types';

import { addJavascriptRules } from './jsRules';
import { addCssRules } from './cssRules';

interface IOpts {
  cwd: string;
  env: Env;
  entry: string;
  hmr: boolean;
}

export async function getConfig(opts: IOpts) {
  const userConfig = await getUserConfig(opts.cwd);

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
    config.entry.unshift(require.resolve('../client/client.js'));
  }

  // devtool
  config.devtool = isDev ? 'eval-source-map' : false;

  // output
  const filename = isDev ? '[name].js' : 'static/js/[contenthash:8].js';
  const absOutputPath = resolve(opts.cwd, DEFAULT_OUTPUT_PATH);
  config.output = { filename, path: absOutputPath, clean: true };

  // resolve
  config.resolve = {
    symlinks: true,
    modules: ['node_modules'],
    alias: {},
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.cjs', '.mjs', '.json', '.wasm'],
  };

  // externals
  config.externals = {};

  // target
  config.target = ['web', 'es5'];

  // cache
  config.cache = { type: 'filesystem' };

  // rules
  config.module = { rules: [] };
  await addJavascriptRules(applyOpts);
  await addCssRules(applyOpts);

  // plugins
  config.plugins = [];
  config.plugins?.push(new webpack.HotModuleReplacementPlugin());
  config.plugins?.push(new BetterInfo({}));

  return { webpackConfig: config, userConfig };
}

async function getUserConfig(cwd: string): Promise<IConfig> {
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
  }

  return config;
}
