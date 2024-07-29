import React from 'react';
import { createRoot } from 'react-dom/client';
import Router from './router';

const root = createRoot(document.getElementById('root'));

function renderApp() {
  root.render(<Router />);
}

renderApp();

