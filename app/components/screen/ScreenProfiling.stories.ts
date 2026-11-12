import type { Meta, StoryObj } from '@nuxtjs/storybook'
// Controls are built at module load, before there's an app to ask for the
// active instance, so stories show Industria's
import industria from '#shared/instances/industria'
import type { ProfilingFieldId } from '#shared/survey/profiling'
import { useSurveyStore } from '../../stores/survey'
import ScreenProfiling from './ScreenProfiling.vue'

const meta = {
  title: 'Screens/Profiling',
  component: ScreenProfiling,
  tags: ['autodocs'],
  argTypes: {
    fieldIndex: {
      control: 'select',
      options: industria.profiling.map((_, index) => index),
      labels: Object.fromEntries(industria.profiling.map((field, index) => [index, field.id]))
    }
  },
  args: {
    fieldIndex: 0
  },
  render: args => ({
    components: { ScreenProfiling },
    setup: () => {
      // The preview shares one Pinia store across stories
      useSurveyStore().reset()
      return { args }
    },
    // Not keyed, like on the page: changing the field plays the transition
    template: `
      <div class="flex min-h-[calc(100vh-4rem)] flex-col">
        <ScreenProfiling v-bind="args" />
      </div>
    `
  })
} satisfies Meta<typeof ScreenProfiling>

export default meta
type Story = StoryObj<typeof meta>

const storyFor = (id: ProfilingFieldId): Story => ({
  args: { fieldIndex: industria.profiling.findIndex(field => field.id === id) }
})

export const Age = storyFor('age')
export const Gender = storyFor('gender')
export const PostalCode = storyFor('postalCode')
// Multiple choice; "Ninguna de las anteriores" is exclusive
export const Diversity = storyFor('diversity')
export const Education = storyFor('education')
export const Occupation = storyFor('occupation')
export const FieldOfStudy = storyFor('fieldOfStudy')
