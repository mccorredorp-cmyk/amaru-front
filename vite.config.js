import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El back permite el origen http://localhost:5173 (CORS_ORIGINS en su .env),
// por eso el front de desarrollo debe correr exactamente en ese puerto.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 todavía usa @import y funciones globales de Sass.
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      },
    },
  },
});
