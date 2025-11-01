import type { Meta, StoryObj } from '@storybook/vue3'
import BaseCard from './BaseCard.vue'

const meta: Meta<typeof BaseCard> = {
  title: '/BaseCard',
  component: BaseCard,
}

export default meta

export const Default: StoryObj<typeof BaseCard> = {
  args: {
    elevation: 4,
    maxWidth: 400,
  },
}
