import { IAutoRoutes } from 'webpack-plugin-auto-routes';
import { ImportSpecifier, ExportSpecifier } from 'es-module-lexer';
import { transform, TransformOptions } from 'esbuild';
import { BetterInfoOptions } from 'webpack-plugin-better-info';
import Config from '../compiled/webpack-5-chain';

export enum Env {
  development = 'development',
  production = 'production',
}

export interface ICopyOpts {
  from: string;
  to: string;
}

export interface IConfig {
  transpiler?: 'babel' | 'swc' | 'esbuild';
  htmlTemplate?: string;
  publicPath?: string;
  devtool?: Config.DevTool;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  externals?: Record<string, string>;
  alias?: Record<string, string>;
  autoRoutesOption?: IAutoRoutes;
  betterInfoOption?: BetterInfoOptions;
  copyPluginOption?: ICopyOpts[] | string[];
  jsMinifier?: 'terser' | 'swc' | 'esbuild' | 'none';
  cssMinifier?: 'cssnano' | 'esbuild' | 'none';
  inlineLimit?: number;
  env?: { [key: string]: any };
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

export interface IEsbuildLoaderHandlerParams {
  code: string;
  filePath: string;
  imports: readonly ImportSpecifier[];
  exports: readonly ExportSpecifier[];
}

export interface IEsbuildLoaderOpts extends Partial<TransformOptions> {
  handler?: Array<(opts: IEsbuildLoaderHandlerParams) => string>;
  implementation?: {
    transform: typeof transform;
  };
}
