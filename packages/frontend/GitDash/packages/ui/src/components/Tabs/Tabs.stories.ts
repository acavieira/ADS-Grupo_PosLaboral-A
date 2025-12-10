import type { Meta, StoryObj } from '@storybook/vue3'
import Tabs from './Tabs.vue'
import type { ITab } from './ITab.ts'


const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    activeTab: { control: 'text' },
    tabs: { control: 'object' },
    'onTab-change': { action: 'tab-changed' },
  },
  args: {
    activeTab: 'overview',
    tabs: [],
  },
}

export default meta
type Story = StoryObj<typeof Tabs>

const sampleTabs: ITab[] = [
  { key: 'overview', title: 'Overview' },
  { key: 'activity', title: 'Activity' },
  { key: 'settings', title: 'Settings' },
  { key: 'user1', title: 'Alice', icon: 'https://i.pravatar.cc/150?u=a' },
  { key: 'user2', title: 'Bob', icon: 'https://i.pravatar.cc/150?u=b' },
]

export const Default: Story = {
  args: {
    activeTab: 'overview',
    tabs: sampleTabs,
  },
  render: (args) => ({
    components: { Tabs },
    setup() {
      return { args }
    },
    template: `
      <div style="background: #f5f5f5; padding: 20px;">
        <Tabs v-bind="args" @tab-change="args.onTabChange" />
      </div>
    `,
  }),
}

export const TextTabsOnly: Story = {
  args: {
    activeTab: 'overview',
    tabs: [
      { key: 'overview', title: 'Overview' },
      { key: 'issues', title: 'Issues' },
      { key: 'pull-requests', title: 'Pull Requests' },
    ],
  },
  render: (args) => ({
    components: { Tabs },
    setup() {
      return { args }
    },
    template: `
      <div style="background: white; padding: 20px;">
        <Tabs v-bind="args" @tab-change="args.onTabChange" />
      </div>
    `,
  }),
}

export const IconTabsOnly: Story = {
  args: {
    activeTab: 'user1',
    tabs: [
      { key: 'user1', title: 'User 1', icon: 'https://i.pravatar.cc/150?u=1' },
      { key: 'user2', title: 'User 2', icon: 'https://i.pravatar.cc/150?u=2' },
      { key: 'user3', title: 'User 3', icon: 'https://i.pravatar.cc/150?u=3' },
    ],
  },
  render: (args) => ({
    components: { Tabs },
    setup() {
      return { args }
    },
    template: `
      <div style="background: white; padding: 20px;">
        <Tabs v-bind="args" @tab-change="args.onTabChange" />
      </div>
    `,
  }),
}
