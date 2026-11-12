import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { useSurveyStore } from '../../stores/survey'
import ScreenStep from './ScreenStep.vue'

// Picks the screen for a step; each screen has its own stories
const meta = {
  title: 'Screens/Step',
  component: ScreenStep,
  tags: ['autodocs'],
  args: {
    step: { kind: 'intro' }
  },
  render: args => ({
    components: { ScreenStep },
    setup: () => {
      // The preview shares one Pinia store across stories
      useSurveyStore().reset()
      return { args }
    },
    template: `
      <div class="flex min-h-[calc(100vh-4rem)] flex-col">
        <ScreenStep :key="JSON.stringify(args.step)" v-bind="args" />
      </div>
    `
  })
} satisfies Meta<typeof ScreenStep>

export default meta
type Story = StoryObj<typeof meta>

export const Intro: Story = {}

export const Splash: Story = {
  args: { step: { kind: 'splash', position: 'before' } },
  globals: { surface: 'light' }
}

export const Question: Story = {
  args: { step: { kind: 'question', worldIndex: 0, questionIndex: 0, flatIndex: 0 } },
  globals: { surface: 'light' }
}
