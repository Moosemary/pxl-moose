import { defineConfig } from 'vite';

// Relativa sökvägar ('./') gör att samma bygge fungerar både på
// https://moosemary.github.io/pxl-moose/ och på en egen domän som pxlmoose.moosemary.com.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
}));
