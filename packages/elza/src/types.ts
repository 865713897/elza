export enum Env {
  development = 'development',
  production = 'production',
}

export interface IConfig {
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
