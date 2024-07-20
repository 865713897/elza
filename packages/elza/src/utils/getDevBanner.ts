import chalk from "chalk";
import stripAnsi from "strip-ansi";

const BORDERS = {
  TL: "┌",
  TR: "┐",
  BL: "└",
  BR: "┘",
  H: "─",
  V: "│",
};

export function getDevBanner() {
  const header = `  > Local:   ${chalk.cyan("http://localhost:3000")}  `;
  const network = `  > Network: ${chalk.cyan("http://192.168.1.100:3000")}  `;
  const footer = `  ${chalk.whiteBright(
    "Now you can open browser with the above address↑"
  )}  `;
  const maxLen = Math.max(
    ...[header, network, footer].map((s) => stripAnsi(s).length)
  );
  const beforeLines = [
    `${BORDERS.TL}${"".padStart(maxLen, BORDERS.H)}${BORDERS.TR}`,
    `${BORDERS.V}${header}${"".padStart(
      maxLen - stripAnsi(header).length,
      " "
    )}${BORDERS.V}`,
  ];
  const mainLine = `${BORDERS.V}${network}${"".padStart(
    maxLen - stripAnsi(network).length,
    " "
  )}${BORDERS.V}`;
  const afterLines = [
    `${BORDERS.V}${footer}${"".padStart(maxLen - stripAnsi(footer).length)}${
      BORDERS.V
    }`,
    `${BORDERS.BL}${"".padStart(maxLen, BORDERS.H)}${BORDERS.BR}`,
  ];

  return {
    before: beforeLines.map((s) => `${"".padStart(8)}${s}`).join("\n"),
    main: mainLine,
    after: afterLines.map((s) => `${"".padStart(8)}${s}`).join("\n"),
  };
}
