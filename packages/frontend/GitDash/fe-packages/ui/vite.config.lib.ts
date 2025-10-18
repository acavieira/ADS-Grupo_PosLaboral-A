import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import path from 'node:path'


export default defineConfig({
  root: __dirname,
  plugins: [
    vue(),
    dts({
      tsconfigPath: path.resolve(__dirname, 'tsconfig.json'),
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'intel-fce-ods-web-ui',
      fileName: (format) => `ui.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'vuetify'],
    },
  },
})


