import React from 'react';
import { createRoot } from 'react-dom/client';
import Router from './router';
import '@/assets/css/common.scss';

const root = createRoot(document.getElementById('root'));

function renderApp() {
  root.render(<Router />);
}

renderApp();

if (module.hot) {
  module.hot.accept('./router', renderApp);
}
