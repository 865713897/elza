import { createContext, useContext, useRef } from 'react';
import type { FC } from 'react';
import { useLocation, useOutlet, matchPath } from 'react-router-dom';
import PathMatcher, { type MatcherStrategy } from './PathMatcher';

interface IKeepAliveLayout {
  keepalive: any[];
  keepElements?: any;
  dropByCacheKey?: (path: string) => void;
}

export const KeepAliveContext = createContext<IKeepAliveLayout>({
  keepalive: [],
  keepElements: {},
});

const isKeepPath = (aliveList: any[], path: string) => {
  const pathMatchers: MatcherStrategy[] = [
    (item, path) => path === item,
    (item, path) => item instanceof RegExp && item.test(path),
    (item, path) => typeof item === 'string' && item.toLowerCase() === path,
  ];
  const matcher = new PathMatcher(pathMatchers);
  let isKeep = false;
  for (const item of aliveList) {
    isKeep = matcher.match(item, path);
  }
  return isKeep;
};

export function useKeepOutlets() {
  const location = useLocation();
  const element = useOutlet();
  const { keepalive, keepElements } = useContext(KeepAliveContext);
  const isKeep = isKeepPath(keepalive, location.pathname);
  if (isKeep) {
    keepElements.current[location.pathname] = element;
  }
  return (
    <>
      {Object.entries(keepElements.current).map(
        ([pathname, element]: [string, any]) => (
          <div
            key={pathname}
            style={{
              height: '100%',
              width: '100%',
              position: 'relative',
              overflow: 'hidden auto',
            }}
            className='rumtime-keep-alive-layout'
            hidden={!matchPath(location.pathname, pathname)}
          >
            {element}
          </div>
        )
      )}
      <div
        hidden={isKeep}
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
          overflow: 'hidden auto',
        }}
        className='rumtime-keep-alive-layout-no'
      >
        {!isKeep && element}
      </div>
    </>
  );
}

const KeepAliveLayout: FC<IKeepAliveLayout> = (props) => {
  const { keepalive, ...rest } = props;
  const keepElements = useRef<any>({});
  function dropByCacheKey(path: string) {
    keepElements.current[path] = null;
  }
  return (
    <KeepAliveContext.Provider
      value={{ keepalive, keepElements, dropByCacheKey }}
      {...rest}
    />
  );
};

export default KeepAliveLayout;
