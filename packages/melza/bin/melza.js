#!/usr/bin/env node

const { Command } = require('commander');
const pkg = require('../package.json');

const program = new Command();

program.usage('<command> [options]');

program.version(pkg.version, '-v, -V, --version');

program.command('help').description('帮助命令');

program
  .command('dev')
  .description('开发环境命令')
  .action(() => {
    const { dev } = require('../lib/dev');
    dev();
  });

program.parse();
