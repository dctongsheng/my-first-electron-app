import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  main: {
    plugins: [],
    build: {
      rollupOptions: {
        output: {
          entryFileNames: '[name].js'
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },
  preload: {
    plugins: [],
    build: {
      rollupOptions: {
        output: {
          entryFileNames: '[name].js'
        }
      }
    }
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/renderer')
      }
    }
  }
})
