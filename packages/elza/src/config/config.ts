import webpack, { Configuration } from 'webpack';
import fs from 'fs';
import { resolve, join } from 'path';
import { build } from 'esbuild';
import Config from '../../compiled/webpack-5-chain';
import { tryPaths } from '../utils/tryPath';
import { getValidPaths } from '../utils/getValidPaths';
import { DEFAULT_OUTPUT_PATH } from '../constants';
import { Env, IConfig } from '../types';

import { addJavascriptRules } from './jsRules';
import { addCssRules } from './cssRules';
import { addAssetRules } from './assetRules';

import { addHtmlWebpackPlugin } from './htmlWebpackPlugin';
import { addMiniCssExtractPlugin } from './miniCssExtractPlugin';
import { addAutoRoutesPlugin } from './autoRoutesPlugin';
import { addCompressPlugin } from './compressPlugin';
import { addBetterInfoPlugin } from './betterInfoPlugin';
import { addCopyPlugin } from './copyPlugin';
import { addDefinePlugin } from './definePlugin';

interface IOpts {
  cwd: string;
  env: Env;
  entry: string;
  hmr: boolean;
  userConfig: IConfig;
}

export async function getConfig(opts: IOpts): Promise<Configuration> {
  const { userConfig } = opts;
  const isDev = opts.env === Env.development;
  const config = new Config();

  const applyOpts = {
    config,
    userConfig,
    cwd: opts.cwd,
    isDev,
  };

  // mode
  config.mode(opts.env);
  config.stats('none');

  // entry
  const entry = config.entry('main');
  if (isDev && opts.hmr) {
    entry.add(require.resolve('../../client/client/client.js'));
  }
  entry.add(opts.entry);

  // devtool
  config.devtool(
    isDev
      ? userConfig.devtool === false
        ? false
        : userConfig.devtool || 'eval-source-map'
      : false,
  );

  // output
  const filename = `static/js/[name]${isDev ? '' : '.[contenthash:8]'}.js`;
  const chunkFilename = `static/js/async/[name]${isDev ? '' : '.[contenthash:8]'}.async.js`;
  const absOutputPath = resolve(opts.cwd, DEFAULT_OUTPUT_PATH);
  config.output
    .path(absOutputPath)
    .filename(filename)
    .chunkFilename(chunkFilename)
    .publicPath(userConfig.publicPath || '/')
    .pathinfo(isDev)
    .set('assetModuleFilename', 'static/[name].[hash:8][ext]')
    .set('hashFunction', 'xxhash64')
    .clean(true);

  // resolve
  config.resolve
    .set('symlinks', true)
    .modules.add('node_modules')
    .end()
    .alias.merge(
      userConfig.alias || {
        '@': opts.cwd + '/src',
      },
    )
    .end()
    .extensions.merge(['.js', '.ts', '.jsx', '.tsx', '.cjs', '.mjs', '.json', '.wasm'])
    .end();

  // externals
  config.externals(userConfig.externals || {});

  // target
  config.target(['web', 'es5']);

  // cache
  config.cache({
    type: 'filesystem',
    version: require('../../package.json').version,
    buildDependencies: {
      config: getValidPaths([
        join(opts.cwd, 'elza.config.js'),
        join(opts.cwd, 'elza.config.ts'),
        join(opts.cwd, 'package.json'),
      ]),
    },
    cacheDirectory: join(opts.cwd, 'node_modules', '.elza', 'cache'),
  });

  config.infrastructureLogging({ level: 'none' });

  // rules
  await addJavascriptRules(applyOpts);
  await addCssRules(applyOpts);
  await addAssetRules(applyOpts);

  // plugins
  if (isDev && opts.hmr) {
    config.plugin('hmr').use(new webpack.HotModuleReplacementPlugin());
  }
  await addHtmlWebpackPlugin(applyOpts);
  await addMiniCssExtractPlugin(applyOpts);
  await addAutoRoutesPlugin(applyOpts);
  await addCompressPlugin(applyOpts);
  await addBetterInfoPlugin(applyOpts);
  await addCopyPlugin(applyOpts);
  await addDefinePlugin(applyOpts);

  if (userConfig.chainWebpack) {
    userConfig.chainWebpack(config, { env: opts.env });
  }

  return config.toConfig();
}

export async function getUserConfig(cwd: string): Promise<IConfig> {
  const configFile = tryPaths([join(cwd, 'elza.config.js'), join(cwd, 'elza.config.ts')]);
  let config = {};
  const outputPath = resolve(cwd, 'node_modules/.elza/elza.config.js');
  if (configFile) {
    const fileContent = fs.readFileSync(configFile, 'utf-8');
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
    const packages = new Set<string>();
    let match: string[];
    while ((match = importRegex.exec(fileContent)) !== null) {
      packages.add(match[1]);
    }
    await build({
      entryPoints: [configFile],
      outfile: outputPath,
      bundle: true,
      format: 'cjs',
      sourcemap: false,
      platform: 'node',
      external: Array.from(packages),
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
