import { Command } from 'commander';
import { join } from 'path';
import { tryPaths } from './utils/tryPath';
import { dev } from './dev';
import { build } from './build';

const cli = new Command();
const cwd = process.cwd();

const entry = tryPaths([
  join(cwd, 'src/index.jsx'),
  join(cwd, 'src/index.tsx'),
  join(cwd, 'src/index.js'),
  join(cwd, 'src/index.ts'),
]);

cli
  .version(
    require('../package.json').version,
    '-v, --version',
    '输出当前框架版本'
  )
  .description('Elza CLI');

cli
  .command('dev')
  .description('启动开发服务器')
  .option('-p, --port <port>', '指定端口号')
  .action(async (options) => {
    process.env.NODE_ENV = 'development';
    await dev({ cwd, entry });
  });

cli
  .command('build')
  .description('打包项目')
  .action(async (options) => {
    process.env.NODE_ENV = 'production';
    await build({ cwd, entry });
  });

cli.parse(process.argv);
