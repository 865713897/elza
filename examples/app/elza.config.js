import { defineConfig } from 'elza';

export default defineConfig({
  transpiler: 'swc',
  htmlTemplate: './public/index.html',
  autoRoutesOption: {
    mode: 'browser',
    indexPath: '/home',
  },
  // externals: { react: 'React', 'react-dom': 'ReactDOM' },
});
