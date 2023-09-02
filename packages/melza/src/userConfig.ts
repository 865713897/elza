import { existsSync } from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import { type IAppData } from './appData';
import { DEFAULT_CONFIG_FILE } from './constants';

export const getUserConfig = ({ appData }: { appData: IAppData }) => {
  return new Promise(async (resolve, reject) => {
    let config = {};
    const configFile = path.resolve(
      appData.paths.absSrcPath,
      DEFAULT_CONFIG_FILE
    );
    if (existsSync(configFile)) {
      await esbuild.build({
        entryPoints: [configFile],
        external: ['esbuild'],
        format: 'cjs',
        logLevel: 'error',
        outdir: appData.paths.absOutputPath,
        bundle: true,
      });
      try {
        config = require(path.resolve(
          appData.paths.absOutputPath,
          'melza.config.js'
        ));
      } catch (error) {
        console.error('getUserConfig error', error);
        reject(error);
      }
    }
    resolve(config);
  });
};
