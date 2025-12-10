import type { Meta, StoryObj } from '@storybook/vue3'
import BaseCard from './BaseCard.vue'

const meta = {
  title: 'UI/BaseCard',
  component: BaseCard,
  tags: ['autodocs'],
  argTypes: {
    elevation: { control: { type: 'number', min: 0, max: 24 } },
    maxWidth: { control: 'text' },
    outlined: { control: 'boolean' },
    className: { control: 'text' },
    default: { control: 'text', description: 'Slot content' },
  },
  args: {
    elevation: 0,
    outlined: false,
    maxWidth: '100%',
  },
} satisfies Meta<typeof BaseCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <h3>Card Title</h3>
        <p>This is the default content inside the card.</p>
      </BaseCard>
    `,
  }),
}

export const WithElevation: Story = {
  args: {
    elevation: 4,
  },
  render: (args) => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>This card has an elevation of 4.</p>
      </BaseCard>
    `,
  }),
}

export const RestrictedWidth: Story = {
  args: {
    maxWidth: '300px',
  },
  render: (args) => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>This card is limited to 300px width.</p>
      </BaseCard>
    `,
  }),
}
