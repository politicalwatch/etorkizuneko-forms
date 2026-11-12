import type { Meta, StoryObj } from '@nuxtjs/storybook'
// Controls are built at module load, before there's an app to ask for the
// active instance, so stories show Industria's
import industria from '#shared/instances/industria'
import { useSurveyStore } from '../../stores/survey'
import ScreenQuestion from './ScreenQuestion.vue'

const meta = {
  title: 'Screens/Question',
  component: ScreenQuestion,
  tags: ['autodocs'],
  globals: { surface: 'light' },
  argTypes: {
    worldIndex: {
      control: 'select',
      options: industria.worlds.map((_, index) => index),
      labels: Object.fromEntries(industria.worlds.map((world, index) => [index, `${world.id} (${world.questions.length} questions)`]))
    },
    questionIndex: { control: { type: 'number', min: 0, max: 5 } }
  },
  args: {
    worldIndex: 0,
    questionIndex: 0
  },
  render: args => ({
    components: { ScreenQuestion },
    setup: () => {
      // The preview shares one Pinia store across stories
      useSurveyStore().reset()
      return { args }
    },
    // Keyed: the screen reads its question once, like on the page
    template: `
      <div class="flex min-h-[calc(100vh-4rem)] flex-col">
        <ScreenQuestion :key="args.worldIndex + '-' + args.questionIndex" v-bind="args" />
      </div>
    `
  })
} satisfies Meta<typeof ScreenQuestion>

export default meta
type Story = StoryObj<typeof meta>

export const FirstQuestion: Story = {}

export const MidWorld: Story = {
  args: { worldIndex: 0, questionIndex: 3 }
}

export const LongStatement: Story = {
  args: { worldIndex: 1, questionIndex: 2 }
}

export const LastWorld: Story = {
  args: { worldIndex: 3, questionIndex: 2 }
}
