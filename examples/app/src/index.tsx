import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import KeepaliveLayout from "@elza/keepalive";
import { getRoutes } from "./routes";

interface IRoutes {
  path: string;
  Component: React.FC;
  children?: IRoutes[];
}

const App = () => {
  const routes: IRoutes[] = getRoutes();
  const renderRoutes = (_routes: IRoutes[]) => {
    return _routes.map((route) => {
      const { path, Component, children = [] } = route || {};
      return (
        <Route key={path} path={path} element={<Component />}>
          {renderRoutes(children)}
        </Route>
      );
    });
  };
  return (
    <KeepaliveLayout keepalive={["/home", /\/user/]}>
      <HashRouter>
        <Routes>{renderRoutes(routes)}</Routes>
      </HashRouter>
    </KeepaliveLayout>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
