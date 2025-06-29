import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '../../',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@reelapps/auth': path.resolve(__dirname, '../../ReelApps/packages/auth/src/index.ts'),
      '@reelapps/ui': path.resolve(__dirname, '../../ReelApps/packages/ui/src/index.ts'),
      '@reelapps-styles': path.resolve(__dirname, '../../ReelApps/src/styles'),
    },
  },
  server: {
    host: true,
    port: 5178,
    strictPort: true,
  },
})