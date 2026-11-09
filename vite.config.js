import { defineConfig } from 'vite';

// På GitHub Pages ligger spelet under /pxl-moose/, lokalt under /.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/pxl-moose/' : '/',
}));
