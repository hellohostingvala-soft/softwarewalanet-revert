import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/app.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
        manualChunks: (id) => {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('@radix-ui')) {
            return 'ui';
          }
          if (id.includes('recharts')) {
            return 'charts';
          }
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('date-fns') || id.includes('lucide-react')) {
            return 'utils';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@radix-ui/react-dialog']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    global: 'globalThis',
  },
  base: './',
  // DigitalOcean + Cloudflare production configuration
  preview: {
    port: 8080,
    host: true
  }
}));
