import type { Meta, StoryObj } from '@storybook/vue3'
import LoginCard from './LoginCard.vue'

const meta: Meta<typeof LoginCard> = {
  title: 'UI/LoginCard',
  component: LoginCard,
}

export default meta

export const Default: StoryObj<typeof LoginCard> = {}

export const LoadingState: StoryObj<typeof LoginCard> = {
  args: {},
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button')
    button?.setAttribute('disabled', 'true')
  },
}

export const ErrorState: StoryObj<typeof LoginCard> = {
  args: {},
  play: async ({ canvasElement }) => {
    const errorEl = document.createElement('p')
    errorEl.textContent = 'Failed to start login.'
    errorEl.className = 'mt-4 text-caption red--text'
    canvasElement.appendChild(errorEl)
  },
}
