import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './pages/home';

const root = createRoot(document.getElementById('root'));

function renderApp() {
  root.render(<Home />);
}

renderApp();

if (module.hot) {
  module.hot.accept('./pages/home', () => {
    renderApp();
  });
}
