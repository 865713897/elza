import { Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const { pathname } = useLocation();
  console.log(pathname, 'pathname');
  return (
    <div>
      <div>当前路由: {pathname}</div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
