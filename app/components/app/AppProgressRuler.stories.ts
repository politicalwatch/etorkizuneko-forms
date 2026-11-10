import type { Meta, StoryObj } from '@nuxtjs/storybook'
import AppProgressRuler from './AppProgressRuler.vue'

const meta = {
  title: 'App/ProgressRuler',
  component: AppProgressRuler,
  tags: ['autodocs'],
  argTypes: {
    progress: { control: { type: 'range', min: 0, max: 1, step: 0.01 } }
  },
  args: {
    progress: 0.34,
    ticks: 30
  }
} satisfies Meta<typeof AppProgressRuler>

export default meta
type Story = StoryObj<typeof meta>

export const InProgress: Story = {}

export const Start: Story = {
  args: { progress: 0 }
}

export const Complete: Story = {
  args: { progress: 1 }
}

export const WithoutPercentage: Story = {
  args: { progress: null }
}
