import type { Meta, StoryObj } from '@storybook/vue3'
import BaseButton from './BaseButton.vue'


const meta: Meta<typeof BaseButton> = {
  title: 'UI/BaseButton',
  component: BaseButton,
  args: { label: 'Click me', color: 'primary' },
}
export default meta


export const Primary: StoryObj<typeof BaseButton> = {}
export const Loading: StoryObj<typeof BaseButton> = { args: { loading: true } }
export const Outlined: StoryObj<typeof BaseButton> = { args: { variant: 'outlined' } }
