import type { Meta, StoryObj } from '@nuxtjs/storybook'
// Controls are built at module load, before there's an app to ask for the
// active instance, so stories show Industria's
import industria from '#shared/instances/industria'
import { useSurveyStore } from '../stores/survey'
import QuestionField from './QuestionField.vue'

const meta = {
  title: 'Survey/QuestionField',
  component: QuestionField,
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
    components: { QuestionField },
    setup: () => {
      // The preview shares one Pinia store across stories
      useSurveyStore().reset()
      return { args }
    },
    // Keyed: the field reads its question once, like in ScreenQuestion
    template: '<div class="max-w-100"><QuestionField :key="args.worldIndex + \'-\' + args.questionIndex" v-bind="args" /></div>'
  })
} satisfies Meta<typeof QuestionField>

export default meta
type Story = StoryObj<typeof meta>

export const FirstQuestion: Story = {}

export const LongStatement: Story = {
  args: { worldIndex: 1, questionIndex: 2 }
}
