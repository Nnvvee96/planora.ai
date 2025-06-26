import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Environment variables - let Vite handle them naturally
  define: {
    // Only define what's absolutely necessary
    __DEV__: JSON.stringify(mode === 'development'),
  },
  build: {
    // Production-ready build configuration
    target: 'es2020',
    minify: 'terser', // Re-enable proper minification
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Remove console.log in production
        drop_debugger: true,
      },
      mangle: {
        // Preserve function names for better debugging
        keep_fnames: /^(React|Component|useState|useEffect)$/,
      },
    },
    // Optimized code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-toast', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'supabase': ['@supabase/supabase-js'],
          'utils': ['clsx', 'tailwind-merge', 'date-fns'],
        },
        // Clean file naming for production
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    // Reasonable bundle size limits
    chunkSizeWarningLimit: 1000,
    // Source maps for debugging (external to keep bundle size down)
    sourcemap: mode === 'development',
    // Asset optimization
    assetsInlineLimit: 4096,
    // CSS code splitting
    cssCodeSplit: true,
    // Build reporting
    reportCompressedSize: true,
  },
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      '@supabase/supabase-js',
      '@radix-ui/react-toast'
    ],
    // Let Vite handle all dependencies naturally
  },
}));
