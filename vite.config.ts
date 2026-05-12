import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite' // <-- MUST HAVE THIS

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(), // <-- MUST HAVE THIS
  ],
})