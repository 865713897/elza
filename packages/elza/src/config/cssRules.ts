import { Configuration } from 'webpack';

interface IOpts {
  config: Configuration;
  cwd: string;
  isDev: boolean;
}

export async function addCssRules(opts: IOpts) {
  const { config, isDev } = opts;

  const rules = [
    {
      test: /\.css$/,
    },
    {
      test: /\.scss$/,
      loader: require.resolve('sass-loader'),
      autoCssModules: true,
    },
    {
      test: /\.less$/,
      loader: require.resolve('less-loader'),
      autoCssModules: true,
    },
  ];

  rules.forEach((rule) => {
    const { test, loader, autoCssModules = false } = rule;
    const newRule: { test: RegExp; oneOf?: any[]; use?: any[] } = { test };
    if (autoCssModules) {
      newRule.oneOf = [
        {
          resourceQuery: /css_modules/,
          use: getLoaders(loader, true, isDev),
        },
        {
          use: getLoaders(loader, false, isDev),
        },
      ];
    } else {
      newRule.use = getLoaders(loader, false, isDev);
    }
    config.module?.rules?.push(newRule);
  });
}

function getLoaders(loader: string | undefined, autoCssModules: boolean, isDev: boolean) {
  const use = [
    isDev ? require.resolve('style-loader') : require.resolve('mini-css-extract-plugin/dist/loader'),
    require.resolve('css-loader'),
    {
      loader: require.resolve('postcss-loader'),
      options: {
        postcssOptions: {
          plugins: [require.resolve('autoprefixer')],
        },
      },
    },
    loader && {
      loader,
      options: {},
    },
  ].filter(Boolean);

  if (autoCssModules) {
    use[1] = {
      loader: require.resolve('css-loader'),
      options: {
        modules: {
          localIdentName: '[name]__[local]-[hash:base64:5]',
        },
      },
    } as any;
  }

  return use;
}
