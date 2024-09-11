import chalk from 'chalk';
import * as address from 'address';
import stripAnsi from 'strip-ansi';

interface IOpts {
  port: number;
}

const BORDERS = {
  TL: '┌',
  TR: '┐',
  BL: '└',
  BR: '┘',
  H: '─',
  V: '│',
};

export function getDevBanner(opts: IOpts) {
  const { port } = opts;
  const header = `  > Local:   ${chalk.cyan(`http://localhost:${port}`)}  `;
  const ip = address.ip();
  const network = `  > Network: ${
    ip ? chalk.cyan(`http://${ip}:${port}`) : chalk.gray('Not available')
  }  `;
  const footer = `  ${chalk.whiteBright('Now you can open browser with the above address↑')}  `;
  const maxLen = Math.max(...[header, network, footer].map((s) => stripAnsi(s).length));
  const beforeLines = [
    `${BORDERS.TL}${''.padStart(maxLen, BORDERS.H)}${BORDERS.TR}`,
    `${BORDERS.V}${header}${''.padStart(maxLen - stripAnsi(header).length, ' ')}${BORDERS.V}`,
  ];
  const mainLine = `${BORDERS.V}${network}${''.padStart(maxLen - stripAnsi(network).length, ' ')}${
    BORDERS.V
  }`;
  const afterLines = [
    `${BORDERS.V}${footer}${''.padStart(maxLen - stripAnsi(footer).length)}${BORDERS.V}`,
    `${BORDERS.BL}${''.padStart(maxLen, BORDERS.H)}${BORDERS.BR}`,
  ];

  return {
    before: beforeLines.map((s) => `${''.padStart(8)}${s}`).join('\n'),
    main: mainLine,
    after: afterLines.map((s) => `${''.padStart(8)}${s}`).join('\n'),
  };
}
