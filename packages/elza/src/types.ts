import { IAutoRoutes } from 'webpack-plugin-auto-routes';

export enum Env {
  development = 'development',
  production = 'production',
}

export interface IConfig {
  transpiler?: 'babel' | 'swc' | 'esbuild';
  htmlTemplate?: string;
  publicPath?: string;
  devtool?: string | false,
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  externals?: Record<string, string>;
  alias?: Record<string, string>;
  autoRoutes?: IAutoRoutes;
  pluginOptions?: Record<string, any>;
  [key: string]: any;
}

export enum Transpiler {
  babel = 'babel',
  swc = 'swc',
  esbuild = 'esbuild',
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}
