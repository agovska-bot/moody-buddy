import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');
  
  // Robustly check for the key in different places (Vercel uses API_KEY, local .env might use VITE_API_KEY)
  const apiKey = env.API_KEY || env.VITE_API_KEY || process.env.API_KEY;

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Inject the key safely into the client-side code
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
  }
})