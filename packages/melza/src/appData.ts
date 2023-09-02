import path from 'path';
import {
  DEFAULT_ENTRY_POINT,
  DEFAULT_OUTDIR,
  DEFAULT_TEMPLATE,
  DEFAULT_GLOBAL_LAYOUTS,
} from './constants';
import { existsSync, readdirSync, statSync } from 'fs';

interface Options {
  cwd: string;
}

export interface IAppData {
  paths: {
    cwd: string;
    absSrcPath: string;
    absPagesPath: string;
    absTmpPath: string;
    absOutputPath: string;
    absEntryPath: string;
    absNodeModulesPath: string;
  };
  pkg: any;
}

export interface IRoute {
  path: string;
  element: string;
  routes?: IRoute[];
}

export const getAppData = ({ cwd }: Options) => {
  return new Promise((resolve: (value: IAppData) => void, reject) => {
    const absSrcPath = path.resolve(cwd, 'src');
    const absPagesPath = path.resolve(cwd, 'src/pages');
    const absNodeModulesPath = path.resolve(cwd, 'node_modules');
    const absTmpPath = path.resolve(absNodeModulesPath, DEFAULT_TEMPLATE);
    const absOutputPath = path.resolve(cwd, DEFAULT_OUTDIR);
    const absEntryPath = path.resolve(cwd, DEFAULT_ENTRY_POINT);

    const paths = {
      cwd,
      absSrcPath,
      absPagesPath,
      absTmpPath,
      absOutputPath,
      absEntryPath,
      absNodeModulesPath,
    };

    const pkg = require(path.resolve(cwd, 'package.json'));

    resolve({ paths, pkg });
  });
};

const getFiles = (root: string) => {
  if (!existsSync(root)) return [];
  return readdirSync(root).filter((file) => {
    const absFile = path.join(root, file);
    const fileStat = statSync(absFile);
    const isFile = fileStat.isFile();
    if (isFile) {
      if (!/\.(j|t)sx?$/.test(file)) return false;
    }
    return true;
  });
};

const filesToRoutes = (files: string[], pagesPath: string): IRoute[] => {
  return files.map((file) => {
    let pagePath = path.basename(file, path.extname(file));
    return {
      path: `/${pagePath}`,
      element: `@/pages/${pagePath}`,
    };
  });
};

export const getRoutes = ({ appData }: { appData: IAppData }) => {
  return new Promise((resolve: (value: IRoute[]) => void) => {
    const files = getFiles(appData.paths.absPagesPath);
    const routes = filesToRoutes(files, appData.paths.absPagesPath);
    const layoutPath = path.resolve(
      appData.paths.absSrcPath,
      DEFAULT_GLOBAL_LAYOUTS
    );
    if (!existsSync(layoutPath)) {
      resolve(routes);
    }
    resolve([
      {
        path: '/',
        element: `@/${DEFAULT_GLOBAL_LAYOUTS}`,
        routes: routes,
      },
    ]);
  });
};
