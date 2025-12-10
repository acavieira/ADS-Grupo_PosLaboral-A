import type { Meta, StoryObj } from '@storybook/vue3'
import StatKpiCard from './StatKpiCard.vue'
import BaseCard from '../BaseCard/BaseCard.vue'

const meta = {
  title: 'UI/StatKpiCard',
  component: StatKpiCard,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    caption: { control: 'text' },
    icon: {
      control: 'select',
      options: ['', 'mdi-account', 'mdi-currency-usd', 'mdi-chart-line', 'mdi-eye']
    },
  },
  args: {
    title: 'Total Revenue',
    value: '$45,200',
    caption: 'Compared to last month',
    icon: '',
  },
} satisfies Meta<typeof StatKpiCard>

export default meta
type Story = StoryObj<typeof meta>

// 1. Default State (No Icon)
export const Default: Story = {
  render: (args) => ({
    components: { StatKpiCard, BaseCard },
    setup() {
      return { args }
    },
    template: `
      <div style="max-width: 300px;">
        <StatKpiCard v-bind="args" />
      </div>
    `,
  }),
}

// 2. With Icon
export const WithIcon: Story = {
  args: {
    title: 'Active Users',
    value: '1,250',
    caption: '+12% since last week',
    icon: 'mdi-account-group',
  },
  render: (args) => ({
    components: { StatKpiCard, BaseCard },
    setup() {
      return { args }
    },
    template: `
      <div style="max-width: 300px;">
        <StatKpiCard v-bind="args" />
      </div>
    `,
  }),
}

