import type { Meta, StoryObj } from '@nuxtjs/storybook'
import AppHeader from './AppHeader.vue'

// "Saber más" only renders when NUXT_PUBLIC_LEARN_MORE_URL is set, so
// without it the header shows just the logo and the language switcher.
const meta = {
  title: 'App/Header',
  component: AppHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' }
} satisfies Meta<typeof AppHeader>

export default meta
type Story = StoryObj<typeof meta>

export const OnDark: Story = {}

export const OnLight: Story = {
  globals: { surface: 'light' }
}
