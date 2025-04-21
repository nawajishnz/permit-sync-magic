import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('Building in mode:', mode);
  console.log('Supabase URL available:', !!env.VITE_SUPABASE_URL);

  return {
    plugins: [react()],
    base: './', // Use relative paths for assets
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 8083,
      host: true,
      watch: {
        usePolling: true,
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      // Ensure environment variables are injected
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: [
              'react-router-dom',
              '@radix-ui/react-dialog',
              '@radix-ui/react-tabs',
              '@radix-ui/react-select'
            ],
            'supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
    define: {
      // Add any custom defines here that need to be accessible in the app
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      // Expose env variables to the client
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
  };
});
