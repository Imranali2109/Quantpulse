import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Ignore the local SQLite db + its WAL/SHM journal files. The backend
      // writes to these constantly (caching quotes, signals, etc.), and Vite
      // was treating those writes as source changes, triggering full page
      // reloads that reset React state back to its default ticker (AAPL).
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/*.db', '**/*.db-wal', '**/*.db-shm'],
      },
    },
  };
});