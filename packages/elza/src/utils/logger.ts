import chalk from 'chalk';

class Logger {
  ready(message: string) {
    console.log(`${chalk.green('ready')} - ${message}`);
  }

  title(message: string) {
    console.log(`  ${message}\n`);
  }
}

export default new Logger();
