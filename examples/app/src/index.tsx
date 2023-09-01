import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

import Layout from './layouts';
import Hello from './pages/hello';
import Users from './pages/user';
import Me from './pages/me';

const root = ReactDOM.createRoot(document.getElementById('root'));

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route path='/' element={<Hello />} />
          <Route path='/users' element={<Users />} />
          <Route path='/me' element={<Me />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

root.render(React.createElement(App));
