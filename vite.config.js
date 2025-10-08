import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'vite-plugin-class-context-binding',
      fileName: (format) => `index.${format}.js`
    }
  }
})
