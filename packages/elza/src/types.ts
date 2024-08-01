import { IAutoRoutes } from 'webpack-plugin-auto-routes';
import Config from '../compiled/webpack-5-chain';

export enum Env {
  development = 'development',
  production = 'production',
}

export interface IConfig {
  transpiler?: 'babel' | 'swc' | 'esbuild';
  htmlTemplate?: string;
  publicPath?: string;
  devtool?: Config.DevTool;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  externals?: Record<string, string>;
  alias?: Record<string, string>;
  autoRoutes?: IAutoRoutes;
  pluginOptions?: Record<string, any>;
  jsMinifier?: 'terser' | 'swc' | 'esbuild' | 'none';
  cssMinifier?: 'cssnano' | 'esbuild' | 'none';
  inlineLimit?: number;
  chainWebpack?: (webpackConfig: any, args: { env: 'development' | 'production' }) => void;
  [key: string]: any;
}

export enum Transpiler {
  babel = 'babel',
  swc = 'swc',
  esbuild = 'esbuild',
}

export enum JSMinifier {
  terser = 'terser',
  swc = 'swc',
  esbuild = 'esbuild',
  none = 'none',
}

export enum CSSMinifier {
  cssnano = 'cssnano',
  esbuild = 'esbuild',
  none = 'none',
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}
