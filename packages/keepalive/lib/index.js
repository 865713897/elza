var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useRef } from 'react';
import { useLocation, useOutlet, matchPath } from 'react-router-dom';
import PathMatcher from './PathMatcher';
export const KeepAliveContext = createContext({
    keepalive: [],
    keepElements: {},
});
const isKeepPath = (aliveList, path) => {
    const pathMatchers = [
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
    return (_jsxs(_Fragment, { children: [Object.entries(keepElements.current).map(([pathname, element]) => (_jsx("div", { style: {
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden auto',
                }, className: 'rumtime-keep-alive-layout', hidden: !matchPath(location.pathname, pathname), children: element }, pathname))), _jsx("div", { hidden: isKeep, style: {
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden auto',
                }, className: 'rumtime-keep-alive-layout-no', children: !isKeep && element })] }));
}
const KeepAliveLayout = (props) => {
    const { keepalive } = props, rest = __rest(props, ["keepalive"]);
    const keepElements = useRef({});
    function dropByCacheKey(path) {
        keepElements.current[path] = null;
    }
    return (_jsx(KeepAliveContext.Provider, Object.assign({ value: { keepalive, keepElements, dropByCacheKey } }, rest)));
};
export default KeepAliveLayout;
