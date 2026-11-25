import type { Meta, StoryObj } from '@nuxtjs/storybook'
import AppFooter from './AppFooter.vue'

const meta = {
  title: 'App/Footer',
  component: AppFooter,
  tags: ['autodocs']
} satisfies Meta<typeof AppFooter>

export default meta
type Story = StoryObj<typeof meta>

export const OnDark: Story = {}

export const OnLight: Story = {
  globals: { surface: 'light' }
}

// Below md the tagline is hidden; resize the viewport to see it
export const Compact: Story = {
  args: { compact: true },
  globals: { surface: 'light' }
}
