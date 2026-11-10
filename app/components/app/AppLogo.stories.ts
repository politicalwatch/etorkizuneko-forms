import type { Meta, StoryObj } from '@nuxtjs/storybook'
import AppLogo from './AppLogo.vue'

// The wordmark is knocked out in the surface background color
const meta = {
  title: 'App/Logo',
  component: AppLogo,
  tags: ['autodocs']
} satisfies Meta<typeof AppLogo>

export default meta
type Story = StoryObj<typeof meta>

export const OnDark: Story = {}

export const OnLight: Story = {
  globals: { surface: 'light' }
}
