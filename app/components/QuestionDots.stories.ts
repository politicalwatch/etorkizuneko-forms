import type { Meta, StoryObj } from '@nuxtjs/storybook'
import QuestionDots from './QuestionDots.vue'

const meta = {
  title: 'Survey/QuestionDots',
  component: QuestionDots,
  tags: ['autodocs'],
  globals: { surface: 'light' },
  args: {
    total: 6,
    current: 0
  }
} satisfies Meta<typeof QuestionDots>

export default meta
type Story = StoryObj<typeof meta>

export const FirstQuestion: Story = {}

export const Halfway: Story = {
  args: { current: 2 }
}

export const LastQuestion: Story = {
  args: { current: 5 }
}
