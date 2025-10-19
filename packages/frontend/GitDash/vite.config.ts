import { fileURLToPath, URL } from 'node:url'


import { defineConfig, searchForWorkspaceRoot } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import ViteFonts from 'unplugin-fonts/vite'
import vuetify from 'vite-plugin-vuetify'
import path from 'node:path'


export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueDevTools(),
    vuetify({
      autoImport: true,
      styles: { configFile: 'src/styles/settings.scss' }, // <-- SCSS tokens
    }),
    ViteFonts({
      fontsource: {
        families: [
          {
            name: 'Roboto',
            weights: [100, 300, 400, 500, 700, 900],
            styles: ['normal', 'italic'],
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      ...(mode === 'development'
        ? {
          '@git-dash/core': path.resolve(__dirname, 'packages/core/src'),
          '@git-dash/ui': path.resolve(__dirname, 'packages/ui/src'),
        }
        : {}),
    },
  },
  server: {
    fs: {
      allow: [
        __dirname,
        path.resolve(__dirname, 'packages'),
        searchForWorkspaceRoot(process.cwd()),
      ],
    },
  },
  optimizeDeps: {
    exclude: ['@git-dash/ui', '@git-dash/core'],
  },
}))
