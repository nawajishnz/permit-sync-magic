
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
      return `export const componentTagger = () => ({ name: 'component-tagger-stub' })`;
    }
    return null;
  }
};

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    componentTaggerDevFix
  ].filter(Boolean),
  server: {
    host: "::",
    port: 8080,
    watch: {
      usePolling: true,
    }
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
}));
