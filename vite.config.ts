import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Production optimizations
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
    },
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase';
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'redux';
            }
            return 'vendor';
          }
          
          // Feature chunks
          if (id.includes('/src/features/auth/')) {
            return 'auth';
          }
          if (id.includes('/src/features/user-profile/')) {
            return 'user-profile';
          }
          if (id.includes('/src/features/travel-planning/')) {
            return 'travel-planning';
          }
          
          // UI chunks
          if (id.includes('/src/ui/') || id.includes('/src/components/ui/')) {
            return 'ui-components';
          }
        },
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      },
    },
    // Bundle size warnings
    chunkSizeWarningLimit: 1000, // 1MB warning threshold
    // Source maps for production debugging (external to keep bundle size down)
    sourcemap: true,
    // Asset optimization
    assetsInlineLimit: 4096, // 4KB
    // CSS code splitting
    cssCodeSplit: true,
    // Enable build reporting
    reportCompressedSize: true,
  },
  // Optimization settings
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
    exclude: ['@react-three/fiber', '@react-three/drei'], // Exclude heavy 3D libraries from pre-bundling
  },
}));
