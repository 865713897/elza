import HtmlWebpackPlugin from 'html-webpack-plugin';
import Config from '../../compiled/webpack-5-chain';
import { IConfig } from '../types';

interface IOpts {
  cwd: string;
  config: Config;
  userConfig: IConfig;
}

export async function addHtmlWebpackPlugin(opts: IOpts) {
  const { config, userConfig } = opts;
  let pluginOptions: HtmlWebpackPlugin.Options = { filename: 'index.html' };
  if (userConfig.htmlTemplate) {
    pluginOptions = {
      ...pluginOptions,
      template: userConfig.htmlTemplate,
    };
  } else {
    pluginOptions = {
      ...pluginOptions,
      templateContent: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Elza</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
      `,
    };
  }
  config.plugin('html-webpack-plugin').use(new HtmlWebpackPlugin(pluginOptions));
}
