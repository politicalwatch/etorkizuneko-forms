import type { Meta, StoryObj } from '@nuxtjs/storybook'
import StageVisual from './StageVisual.vue'

// Placeholder: will become the video / image-sequence animation
const meta = {
  title: 'Survey/StageVisual',
  component: StageVisual,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['circle', 'world'] }
  },
  args: {
    variant: 'circle'
  }
} satisfies Meta<typeof StageVisual>

export default meta
type Story = StoryObj<typeof meta>

export const Circle: Story = {}

export const World: Story = {
  args: { variant: 'world' },
  globals: { surface: 'light' }
}
