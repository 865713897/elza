import React from "react";
import withLazyLoad from "./utils/withLazyLoad";

export function getRoutes() {
  const routes = [
    {
      path: "/",
      Component: withLazyLoad(React.lazy(() => import("@/layouts"))),
      children: [
        {
          path: "/home",
          Component: withLazyLoad(React.lazy(() => import("@/pages/home"))),
          children: [],
        },
        {
          path: "/me",
          Component: withLazyLoad(React.lazy(() => import("@/pages/me"))),
          children: [],
        },
        {
          path: "/user",
          Component: withLazyLoad(React.lazy(() => import("@/pages/user"))),
          children: [],
        },
      ],
    },
  ];
  return routes;
}
