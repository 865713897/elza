export enum Env {
  development = 'development',
  production = 'production',
}

export interface IConfig {
  transpiler?: 'babel' | 'swc' | 'esbuild';
  template?: string;
  publicPath?: string;
  writeToDisk?: boolean | ((targetPath: string) => boolean);
  externals?: Record<string, string>;
  alias?: Record<string, string>;
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
