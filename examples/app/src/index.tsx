import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import KeepAliveLayout from '@elza/keepalive';

import Layout from './layouts';
import Hello from './pages/hello';
import Users from './pages/user';
import Me from './pages/me';

const root = ReactDOM.createRoot(document.getElementById('root'));

const App = () => {
  return (
    <KeepAliveLayout keepalive={['/home']}>
      <HashRouter>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route path='/home' element={<Hello />} />
            <Route path='/users' element={<Users />} />
            <Route path='/me' element={<Me />} />
          </Route>
        </Routes>
      </HashRouter>
    </KeepAliveLayout>
  );
};

root.render(React.createElement(App));
