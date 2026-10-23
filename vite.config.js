import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, /api is proxied to the backend so the httpOnly refresh cookie stays same-origin.
// Change the target if your API does not run on port 5000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000', changeOrigin: true } },
  },
});
