import type { Meta, StoryObj } from '@nuxtjs/storybook'
import AppHeader from './AppHeader.vue'

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
