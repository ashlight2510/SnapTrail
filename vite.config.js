import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // 빌드 시 모든 파일을 포함
    copyPublicDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});

