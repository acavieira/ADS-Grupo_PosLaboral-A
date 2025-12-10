import type { Meta, StoryObj } from '@storybook/vue3'
import DataErrorAlert from './DataErrorAlert.vue'

const meta = {
  title: 'UI/DataErrorAlert',
  component: DataErrorAlert,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    resourceName: { control: 'text' },
    default: { control: 'text', description: 'Slot content override' },
    // This replaces fn() to log the event in the Actions panel
    onRetry: { action: 'retry-clicked' },
  },
  args: {
    title: 'Access Restricted or Data Unavailable',
    resourceName: '',
  },
} satisfies Meta<typeof DataErrorAlert>

export default meta
type Story = StoryObj<typeof meta>

// 1. Default state (generic message)
export const Default: Story = {
  render: (args) => ({
    components: { DataErrorAlert },
    setup() {
      return { args }
    },
    template: `
      <DataErrorAlert v-bind="args" />
    `,
  }),
}

// 2. With a specific resource name (changes the fallback text)
export const WithResourceName: Story = {
  args: {
    resourceName: 'finance-dashboard-repo',
  },
  render: (args) => ({
    components: { DataErrorAlert },
    setup() {
      return { args }
    },
    template: `
      <DataErrorAlert v-bind="args" />
    `,
  }),
}

// 3. Custom Title
export const CustomTitle: Story = {
  args: {
    title: 'Connection Lost',
  },
  render: (args) => ({
    components: { DataErrorAlert },
    setup() {
      return { args }
    },
    template: `
      <DataErrorAlert v-bind="args" />
    `,
  }),
}

// 4. Custom Slot Content (overriding the default message)
export const CustomContent: Story = {
  render: (args) => ({
    components: { DataErrorAlert },
    setup() {
      return { args }
    },
    template: `
      <DataErrorAlert v-bind="args">
        <p>
          We are unable to load the charts right now.
          Please check your internet connection.
        </p>
      </DataErrorAlert>
    `,
  }),
}
