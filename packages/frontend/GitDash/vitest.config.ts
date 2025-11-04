import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, mergeConfig, configDefaults } from 'vitest/config'
import baseViteConfig from './vite.config'


const viteConfigObject =
  typeof baseViteConfig === 'function'
    ? baseViteConfig({ command: 'serve', mode: 'test' })
    : baseViteConfig


export default mergeConfig(
  viteConfigObject,
  defineConfig({
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@git-dash/core': path.resolve(__dirname, 'packages/core/src'),
        '@git-dash/ui': path.resolve(__dirname, 'packages/ui/src'),
      },
      dedupe: ['vue'],
    },
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      css: true,
      server: {
        deps: { inline: ['vuetify'] },
      },
      setupFiles: './src/__tests__/setup.ts',
    },
    ssr: { noExternal: ['vuetify'] },
  }),
)
