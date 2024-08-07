import { defineConfig } from 'elza';
import CopyPlugin from 'copy-webpack-plugin';

export default defineConfig({
  htmlTemplate: './public/index.html',
  chainWebpack: (config) => {
    config.plugin('copy-webpack-plugin').use(
      new CopyPlugin({
        patterns: [
          {
            from: './public',
            to: '.',
            globOptions: {
              ignore: ['**/index.html'],
            },
            noErrorOnMissing: true, // 设置为true，即使目标文件夹不存在也不报错
          },
        ],
      }),
    );
  },
});
