import type { Meta, StoryObj } from '@nuxtjs/storybook'
import AppLocaleSwitcher from './AppLocaleSwitcher.vue'

// Switching language here changes the locale of the whole Storybook preview
const meta = {
  title: 'App/LocaleSwitcher',
  component: AppLocaleSwitcher,
  tags: ['autodocs']
} satisfies Meta<typeof AppLocaleSwitcher>

export default meta
type Story = StoryObj<typeof meta>

export const OnDark: Story = {}

export const OnLight: Story = {
  globals: { surface: 'light' }
}
