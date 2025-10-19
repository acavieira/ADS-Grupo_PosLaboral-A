import type { Preview } from '@storybook/vue3'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { setup } from '@storybook/vue3'


setup((app) => {
  app.use(createVuetify())
})


const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
  },
}
export default preview


