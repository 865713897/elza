const esbuild = require('esbuild');
esbuild
  .build({
    entryPoints: ['src/cli.ts'],
    bundle: true,
    outdir: 'dist',
    format: 'cjs',
    sourcemap: false,
    platform: 'node',
    external: [
      'esbuild',
      'webpack',
      'webpack-cli',
      'webpack-dev-server',
      'babel-loader',
      '@babel/preset-env',
      '@babel/preset-react',
      'swc-loader',
      'sass-loader',
      'style-loader',
      'css-loader',
      'less-loader',
      'postcss-loader',
      'autoprefixer',
      'babel-plugin-auto-css-module',
      'swc-plugin-auto-css-module',
      '../client/client.js',
    ],
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ['src/client/client.ts'],
    bundle: true,
    outdir: 'client',
    format: 'cjs',
    sourcemap: false,
    platform: 'node',
    external: [],
  })
  .catch(() => process.exit(1));
