import type { Meta, StoryObj } from '@nuxtjs/storybook'
import AppTagline from './AppTagline.vue'

const meta = {
  title: 'App/Tagline',
  component: AppTagline,
  tags: ['autodocs']
} satisfies Meta<typeof AppTagline>

export default meta
type Story = StoryObj<typeof meta>

export const OnDark: Story = {}

export const OnLight: Story = {
  globals: { surface: 'light' }
}
