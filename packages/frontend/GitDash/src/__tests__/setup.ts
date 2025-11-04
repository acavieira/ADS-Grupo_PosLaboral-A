import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'


import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'


// Create a Vuetify instance for tests
const vuetify = createVuetify({
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  theme: { defaultTheme: 'light' },
})


config.global.plugins = [vuetify]


class RO {
  disconnect() {}
  observe() {}
  unobserve() {}
}
;(globalThis as any).ResizeObserver ??= RO


