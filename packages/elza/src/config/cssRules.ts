import { Configuration } from 'webpack';

interface IOpts {
  config: Configuration;
  cwd: string;
  isDev: boolean;
}

export async function addCssRules(opts: IOpts) {
  const { config } = opts;

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
          use: getLoaders(loader, true),
        },
        {
          use: getLoaders(loader, false),
        },
      ];
    } else {
      newRule.use = getLoaders(loader, false);
    }
    config.module?.rules?.push(newRule);
  });
}

function getLoaders(loader: string | undefined, autoCssModules: boolean) {
  const use = [
    require.resolve('style-loader'),
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
