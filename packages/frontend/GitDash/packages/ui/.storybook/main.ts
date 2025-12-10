import type { StorybookConfig } from '@storybook/vue3-vite'
import vue from '@vitejs/plugin-vue'
import { join, dirname } from 'path'


/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: getAbsolutePath('@storybook/vue3-vite'),
    options: {},
  },
  viteFinal: async (cfg) => {
    cfg.plugins = cfg.plugins || []
    const hasVue = cfg.plugins.some((p: any) => p?.name === 'vite:vue')
    if (!hasVue) cfg.plugins.push(vue())
    cfg.resolve = {
      ...(cfg.resolve || {}),
      dedupe: ['vue'],
    }
    return cfg
  },
}
export default config


