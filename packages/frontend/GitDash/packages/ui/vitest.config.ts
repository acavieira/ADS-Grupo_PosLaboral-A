import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'


export default defineConfig({
  plugins: [vue()],
  ssr: {
    noExternal: ['vuetify'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
    server: {
      deps: { inline: ['vuetify'] },
    },
    css: true,
  },
})
