import { transform as defaultEsbuildTransform, Loader as EsbuildLoader } from 'esbuild';
import { init, parse } from 'es-module-lexer';
import { extname } from 'path';
import { LoaderContext } from 'webpack';
import { IEsbuildLoaderOpts } from '../types';

const LOADER_MAP = {
  js: 'js',
  cjs: 'js',
  mjs: 'js',
  jsx: 'jsx',
  cjsx: 'jsx',
  mjsx: 'jsx',
  ts: 'ts',
  ctx: 'ts',
  mts: 'ts',
  tsx: 'tsx',
  ctsx: 'tsx',
  mtsx: 'tsx',
} satisfies Record<string, EsbuildLoader>;

async function esbuildLoader(
  this: LoaderContext<IEsbuildLoaderOpts>,
  source: string,
): Promise<void> {
  const done = this.async();
  const options: IEsbuildLoaderOpts = this.getOptions();
  const { handler = [], implementation, ...otherOptions } = options;
  const transform = implementation?.transform || defaultEsbuildTransform;

  const filePath = this.resourcePath;

  const ext = extname(filePath).slice(1) as keyof typeof LOADER_MAP;
  const loader = LOADER_MAP[ext] || 'default';

  const transformOptions = {
    loader: loader as EsbuildLoader,
    ...otherOptions,
    target: options.target ?? 'es2015',
    sourcemap: this.sourceMap,
    sourcefile: filePath,
  };

  try {
    let { code, map } = await transform(source, transformOptions);

    if (handler.length) {
      await init;
      handler.forEach((fn) => {
        const [imports, exports] = parse(code);
        code = fn({ code, imports, exports, filePath });
      });
    }

    done(null, code, map && JSON.parse(map));
  } catch (error: unknown) {
    done(error as Error);
  }
}

export default esbuildLoader;
