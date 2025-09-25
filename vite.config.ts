import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import packageJson from './package.json'

// https://vite.dev/config/
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // package.json 버전 사용
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  server: {
    host: true, // 모바일 테스팅을 위한 네트워크 노출
    port: 5173,
  },
})
