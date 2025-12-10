import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Styles
import 'vuetify/styles'
// If you use icons, make sure to import them here (requires @mdi/font package)
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
  },
})

setup((app) => {
  app.use(vuetify)
})

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
  },
  // Wraps every story in v-app to ensure Vuetify styles work correctly
  decorators: [
    (story) => ({
      components: { story },
      template: `
        <v-app>
          <v-main>
            <story />
          </v-main>
        </v-app>
      `,
    }),
  ],
}

export default preview
