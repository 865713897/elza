import { writeFileSync, mkdir } from "fs";
import path from "path";
import { DEFAULT_OUTDIR, DEFAULT_FRAMEWORK_NAME } from "./constants";
import { type IAppData, type IRoute } from "./appData";
import { type IUserConfig } from "./userConfig";

const prettier = require("../utils/prettier");

const renderRoutes = (routes: IRoute[]): any => {
  return routes.map((route) => {
    const { path, element, routes = [] } = route;
    return `
      {
        path: '${path}',
        Component: withLazyLoad(React.lazy(() => import('${element}'))),
        children: [${renderRoutes(routes)}],
      }
    `;
  });
};

export const generateRoutes = ({
  appData,
  routes,
}: {
  appData: IAppData;
  routes: IRoute[];
}) => {
  return new Promise(async (resolve, reject) => {
    const content = `
    import React from 'react';
    import withLazyLoad from './utils/withLazyLoad';

    export function getRoutes() {
      const routes = [${renderRoutes(routes)}]
      return routes;
    }
  `;
    const formatContent = await prettier.format(content, {
      parser: "typescript",
    });
    try {
      mkdir(appData.paths.absSrcPath, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        }
        writeFileSync(
          appData.paths.absSrcPath + "/routes.tsx",
          formatContent,
          "utf-8"
        );
        resolve({});
      });
    } catch (error) {
      reject({});
    }
  });
};

const configStringify = (config: (string | RegExp)[]) => {
  return config.map((item) => {
    if (item instanceof RegExp) {
      return item;
    }
    return `'${item}'`;
  });
};

export const generateEntry = ({
  appData,
  userConfig,
}: {
  appData: IAppData;
  userConfig: IUserConfig;
}) => {
  return new Promise(async (resolve, reject) => {
    const { keepalive = [] } = userConfig;
    const content = `
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import { HashRouter, Routes, Route } from 'react-router-dom';
      import KeepaliveLayout from '@elza/keepalive';
      import { getRoutes } from './routes';

      interface IRoutes {
        path: string;
        Component: React.FC;
        children?: IRoutes[];
      }

      const App = () => {
        const routes:IRoutes[] = getRoutes();
        const renderRoutes = (_routes: IRoutes[]) => {
          return _routes.map((route) => {
            const { path, Component, children = [] } = route || {};
            return (
              <Route key={path} path={path} element={<Component />}>
                {renderRoutes(children)}
              </Route>
            )
          })
        }
        return (
          <KeepaliveLayout keepalive={[${configStringify(keepalive)}]}>
            <HashRouter>
              <Routes>
                {renderRoutes(routes)}
              </Routes>
            </HashRouter>
          </KeepaliveLayout>
        )
      }

      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
    `;
    const formatContent = await prettier.format(content, {
      parser: "typescript",
    });
    try {
      mkdir(appData.paths.absSrcPath, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        }
        writeFileSync(
          appData.paths.absSrcPath + "/index.tsx",
          formatContent,
          "utf-8"
        );
        resolve({});
      });
    } catch (error) {
      reject({});
    }
  });
};

export const generateHtml = ({
  appData,
  userConfig,
}: {
  appData: IAppData;
  userConfig: IUserConfig;
}) => {
  return new Promise((resolve, reject) => {
    const { title } = userConfig;
    const content = `
    <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <title>${title ?? appData.pkg.name ?? "melza"}</title>
        </head>
        
        <body>
            <div id="root">
                <span>loading...</span>
            </div>
            <script src="/${DEFAULT_OUTDIR}/index.js"></script>
        </body>
        </html>`;
    try {
      const htmlPath = path.resolve(appData.paths.absOutputPath, "index.html");
      mkdir(path.dirname(htmlPath), { recursive: true }, (err) => {
        if (err) {
          reject(err);
        }
        writeFileSync(htmlPath, content, "utf-8");
        resolve({});
      });
    } catch (error) {
      reject({});
    }
  });
};
