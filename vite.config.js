import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': { // Префикс пути, который будет перехватываться
        target: 'https://apps.mitso.by', // Куда перенаправлять
        changeOrigin: true, // Меняет заголовок Origin на целевой домен
        rewrite: (path) => path.replace(/^\/api/, '/frontend/web') // Изменяет путь
      }
    }
  },
})
