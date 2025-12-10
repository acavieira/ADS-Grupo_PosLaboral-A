import type { Meta, StoryObj } from '@storybook/vue3'
import UrlInputCard from './UrlInputCard.vue'
import BaseCard from '../BaseCard/BaseCard.vue'
import BaseButton from '../BaseButton/BaseButton.vue'

const meta: Meta<typeof UrlInputCard> = {
  title: 'UI/UrlInputCard',
  component: UrlInputCard,
  tags: ['autodocs'],
  argTypes: {
    'onLoad-url': { action: 'load-url' },
  },
  parameters: {
    docs: {
      description: {
        component: 'A card component that accepts a repository URL and emits it upon submission.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof UrlInputCard>

export const Default: Story = {
  render: (args) => ({
    components: { UrlInputCard, BaseCard, BaseButton },
    setup() {
      return { args }
    },
    template: `
      <div style="max-width: 600px; margin: 0 auto;">
        <UrlInputCard v-bind="args" @load-url="args.onLoadUrl" />
      </div>
    `,
  }),
}
