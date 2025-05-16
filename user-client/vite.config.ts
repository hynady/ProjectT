import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Enable environment variable replacement in index.html
  envPrefix: 'VITE_',
  build: {
    // Generate a separate env config file that can be loaded at runtime
    rollupOptions: {
      output: {
        // Enable manual chunks to separate env config
        manualChunks: {
          'env-config': ['./src/env-config.ts']
        }
      }
    }
  }
})
