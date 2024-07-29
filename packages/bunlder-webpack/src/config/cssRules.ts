import Config from '../../compiled/webpack-5-chain';

interface IOpts {
  config: Config;
  cwd: string;
  isDev: boolean;
}

export async function addCssRules(opts: IOpts) {
  const { config, isDev } = opts;

  const rules = [
    {
      name: 'css',
      test: /\.css$/,
      openCssModules: false,
    },
    {
      name: 'scss',
      test: /\.scss$/,
      loader: require.resolve('sass-loader'),
      openCssModules: true,
    },
    {
      name: 'less',
      test: /\.less$/,
      loader: require.resolve('less-loader'),
      openCssModules: true,
    },
  ];

  for (const { name, test, loader, openCssModules } of rules) {
    const rule = config.module.rule(name);
    const nestRulesConfig = [
      openCssModules && {
        nestRule: rule
          .test(test)
          .oneOf('css-modules')
          .resourceQuery(/css_modules/),
        isAutoCssModules: true,
      },
      {
        nestRule: rule.test(test).oneOf('normal').sideEffects(true),
        isAutoCssModules: false,
      },
    ].filter(Boolean);
    for (const { nestRule, isAutoCssModules } of nestRulesConfig) {
      if (isDev) {
        nestRule.use('style-loader').loader(require.resolve('style-loader'));
      } else {
        nestRule
          .use('mini-css-extract-loader')
          .loader(require.resolve('mini-css-extract-plugin/dist/loader'));
      }
      nestRule
        .use('css-loader')
        .loader(require.resolve('css-loader'))
        .options({
          modules: isAutoCssModules
            ? {
                localIdentName: '[name]__[local]-[hash:base64:5]',
              }
            : undefined,
        });
      nestRule
        .use('postcss-loader')
        .loader(require.resolve('postcss-loader'))
        .options({ postcssOptions: { plugins: [require.resolve('autoprefixer')] } });
      if (loader) {
        nestRule.use(loader).loader(loader);
      }
    }
  }
}
