import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'a-propos.html'),
        campus: resolve(import.meta.dirname, 'campus.html'),
        kids: resolve(import.meta.dirname, 'kids.html'),
        worship: resolve(import.meta.dirname, 'worship.html'),
        messages: resolve(import.meta.dirname, 'messages.html'),
        contact: resolve(import.meta.dirname, 'contact.html')
      }
    }
  }
});
