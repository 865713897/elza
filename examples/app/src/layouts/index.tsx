import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useKeepOutlets } from '@elza/keepalive';

const Layout = () => {
  const { pathname } = useLocation();
  const element = useKeepOutlets();
  
  return (
    <div>
      <div>当前路由: {pathname}</div>
      <div>
        {element}
      </div>
    </div>
  );
};

export default Layout;
