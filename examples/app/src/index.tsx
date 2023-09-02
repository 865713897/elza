
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
          <Route path='/' element={withLazyLoad(route.element)}><Route path='/home' element={withLazyLoad(route.element)}></Route>
<Route path='/me' element={withLazyLoad(route.element)}></Route>
<Route path='/user' element={withLazyLoad(route.element)}></Route>
</Route>

        </Routes>
      </HashRouter>
    </KeepaliveLayout>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
    