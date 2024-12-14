import { defineConfig } from 'vite'

export default defineConfig({
  // ... other config options ...
  build: {
    rollupOptions: {
      external: ['serialport']
    }
  }
}) 