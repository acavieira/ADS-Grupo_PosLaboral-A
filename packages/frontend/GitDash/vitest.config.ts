import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, mergeConfig, configDefaults } from 'vitest/config'
import baseViteConfig from './vite.config'

const dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url))

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
        // 2. Used 'dirname' variable here instead of '__dirname' for safety
        '@git-dash/core': path.resolve(dirname, 'packages/core/src'),
        '@git-dash/ui': path.resolve(dirname, 'packages/ui/src'),
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
      ],
      coverage: {
        provider: 'v8',
        enabled: true,
        reporter: ['text', 'html'],
        exclude: [
          ...configDefaults.exclude, // Keeps default excludes like node_modules
          '**/index.ts',
          '**/*.js',                 // Ignore all JS files
          '**/*.cjs',
          '**/*.mjs',
          '**/*.d.ts',
          '**/types.ts',
          '**/types/*.ts',
          'src/main.ts',
          'src/App.vue',
          'src/config.ts',
          'src/plugins/**',
          '**/env.d.ts',
          '**/models/**',            // Ignore models folder
          '**/.storybook/**',
          '**/*.stories.ts',         // Ignore stories
          '**/*.stories.vue',
          '**/dist/**',              // Ignore build output
          'packages/*/dist/**',       // explicit ignore for package builds
          '**/setup.ts'
        ],
      },
    },
  }),
)
