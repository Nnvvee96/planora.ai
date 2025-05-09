import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, 'src/config');
  return {
    plugins: [react()],
    define: {
      'process.env.VITE_LLM_API_KEY': JSON.stringify(env.VITE_LLM_API_KEY),
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL)
    }
  };
});