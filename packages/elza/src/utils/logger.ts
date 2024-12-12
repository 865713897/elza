import chalk from 'chalk';

class Logger {
  ready(message: string) {
    console.log(`${chalk.green('ready')} - ${message}`);
  }

  title(message: string) {
    console.log(`${chalk.bold(message)}\n`);
  }

  event(message: string) {
    console.log(`${chalk.magenta('event')} - ${message}`);
  }

  error(message: string) {
    console.log(`${chalk.red('error')} - ${message}`);
  }
}

export default new Logger();
