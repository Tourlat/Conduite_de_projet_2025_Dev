import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(() => {
  const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:8080'


  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true
        }
      }
    }
  }
})
