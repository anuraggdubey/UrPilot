import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import manifest from './manifest.config';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        sidepanel: 'src/sidepanel/sidepanel.html',
        options: 'src/options/options.html',
        offscreen: 'src/offscreen/offscreen.html'
      }
    }
  }
});
