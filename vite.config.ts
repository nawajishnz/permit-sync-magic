
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Fix for ESM-only libraries
const componentTaggerDevFix = {
  name: 'component-tagger-dev-fix',
  resolveId(id: string) {
    if (id === 'lovable-tagger') {
      return { id: 'lovable-tagger-stub', external: false };
    }
    return null;
  },
  load(id: string) {
    if (id === 'lovable-tagger-stub') {
      return `export const componentTagger = () => { return { handler: () => {} } }`;
    }
    return null;
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), componentTaggerDevFix],
  server: {
    host: '0.0.0.0',
    port: 8080,
    hmr: {
      clientPort: 443, // Use the same port as the server
    },
    // Only for dev-server
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ['**/node_modules/**'],
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
