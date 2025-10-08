import { defineConfig } from 'vite'
import classContextBinding from 'vite-plugin-class-context-binding'

export default defineConfig({
  plugins: [
    classContextBinding({
      forceMethodToClassProperty: true,
      bindGetterAndSetterForPrivateProperty: true,
    }),
  ],
  outDir: 'dist',
  build: {
    minify: false,
    lib: {
      name: 'demo',
      entry: './demo.js',
    },
  },
})
