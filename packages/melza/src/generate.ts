import { writeFileSync, mkdir } from 'fs';
import path from 'path';
import { DEFAULT_OUTDIR, DEFAULT_FRAMEWORK_NAME } from './constants';
import { type IAppData, type IRoute } from './appData';

const prettier = require('../utils/prettier');

const getRoutesStr = (routes: IRoute[]) => {
  let routesStr = '';
  routes.forEach((route) => {
    routesStr += `<Route path='${route.path}' element={<withLazyLoad(route.element) />}>`;
    if (Array.isArray(route.routes) && route.routes.length > 0) {
      routesStr += getRoutesStr(route.routes);
    }
    routesStr += '</Route>\n';
  });
  return routesStr;
};

export const generateRoutes = ({
  appData,
  routes,
}: {
  appData: IAppData;
  routes: IRoute[];
}) => {
  return new Promise((resolve, reject) => {
    const content = `
    import React from 'react';
    import withLazyLoad from './utils/withLazyLoad';

    export function getRoutes() {
      const routes = [
        ${routes.map((route) => {
          return `
            { 
              path: ${route.path},
              element: React.lazy(() => import('${route.element}'))
            },
          `;
        })}
      ]
    }
  `;
    try {
      mkdir(appData.paths.absSrcPath, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        }
        writeFileSync(
          appData.paths.absSrcPath + '/index.tsx',
          content,
          'utf-8'
        );
        resolve({});
      });
    } catch (error) {
      reject({});
    }
  });
};

export const generateEntry = ({
  appData,
  routes,
}: {
  appData: IAppData;
  routes: IRoute[];
}) => {
  return new Promise(async (resolve, reject) => {
    const routesStr = getRoutesStr(routes);
    const content = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import KeepaliveLayout from '@elza/keepalive';
import withLazyLoad from './utils/withLazyLoad';

const App = () => {
  return (
    <KeepaliveLayout keepalive={['/home']}>
      <HashRouter>
        <Routes>
          ${routesStr}
        </Routes>
      </HashRouter>
    </KeepaliveLayout>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
    `;
    try {
      mkdir(appData.paths.absSrcPath, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        }
        writeFileSync(
          appData.paths.absSrcPath + '/index.tsx',
          content,
          'utf-8'
        );
        resolve({});
      });
    } catch (error) {
      reject({});
    }
  });
};

export const generateHtml = ({ appData }: { appData: IAppData }) => {
  return new Promise((resolve, reject) => {
    const content = `
    <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <title>${appData.pkg.name ?? 'melza'}</title>
        </head>
        
        <body>
            <div id="root">
                <span>loading...</span>
            </div>
            <script src="/${DEFAULT_OUTDIR}/index.js"></script>
        </body>
        </html>`;
    try {
      const htmlPath = path.resolve(appData.paths.absOutputPath, 'index.html');
      mkdir(path.dirname(htmlPath), { recursive: true }, (err) => {
        if (err) {
          reject(err);
        }
        writeFileSync(htmlPath, content, 'utf-8');
        resolve({});
      });
    } catch (error) {
      reject({});
    }
  });
};
