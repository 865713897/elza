import { defineConfig } from 'elza';

export default defineConfig({
  transpiler: 'swc',
  htmlTemplate: './public/index.html',
  // chainWebpack: (config) => {
  //   config.plugins.push(
  //     new CopyPlugin({
  //       patterns: [
  //         {
  //           from: './public',
  //           to: '.',
  //           globOptions: {
  //             ignore: ['**/index.html'],
  //           },
  //           noErrorOnMissing: true, // 设置为true，即使目标文件夹不存在也不报错
  //         },
  //       ],
  //     }),
  //   );
  // },
});
