import CopyPlugin, { Pattern } from 'copy-webpack-plugin';
import { join, resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import Config from '../../compiled/webpack-5-chain/types';
import { IConfig, ICopyOpts } from '../types';

interface IOpts {
  cwd: string;
  config: Config;
  userConfig: IConfig;
}

export async function addCopyPlugin(opts: IOpts) {
  const { config, cwd, userConfig } = opts;
  const publicDir = join(cwd, 'public');
  let copyPatterns: Array<Pattern> = [];
  if (existsSync(publicDir) && readdirSync(publicDir).length) {
    copyPatterns.push({
      from: publicDir,
      globOptions: {
        ignore: ['**/index.html'],
      },
      noErrorOnMissing: true, // 设置为true，即使目标文件夹不存在也不报错
      info: { minimized: true },
    });
  } 
  if (Array.isArray(userConfig.copyPluginOption)) {
    copyPatterns = copyPatterns.concat(
      userConfig.copyPluginOption?.map((pattern: string | ICopyOpts) => {
        if (typeof pattern === 'string') {
          return {
            from: pattern,
            info: { minimized: true },
          };
        }
        return {
          from: resolve(cwd, pattern.from),
          to: resolve(cwd, pattern.to),
          info: { minimized: true },
        };
      }),
    );
  }
  if (copyPatterns.length) {
    config.plugin('copy').use(CopyPlugin, [{ patterns: copyPatterns }]);
  }
}
