import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, mergeConfig, configDefaults } from 'vitest/config'
import baseViteConfig from './vite.config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const viteConfigObject =
  typeof baseViteConfig === 'function'
    ? baseViteConfig({
        command: 'serve',
        mode: 'test',
      })
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
    ssr: {
      noExternal: ['vuetify'],
    },
    test: {
      projects: [
        {
          extends: true,
          test: {
            environment: 'jsdom',
            exclude: [...configDefaults.exclude, 'e2e/**'],
            css: true,
            server: {
              deps: {
                inline: ['vuetify'],
              },
            },
            setupFiles: './src/__tests__/setup.ts',
          },
        },
        {
          extends: true,
          plugins: [
            // The plugin will run tests for the stories defined in your Storybook config
            // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
            }),
          ],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: 'playwright',
              instances: [
                {
                  browser: 'chromium',
                },
              ],
            },
            setupFiles: ['.storybook/vitest.setup.ts'],
          },
        },
      ],
    },
  }),
)

/*import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // <-- aqui @ = src
    },
  },
})*/
