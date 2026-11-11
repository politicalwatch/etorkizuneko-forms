import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { watchEffect } from 'vue'
// Controls are built at module load, before there's an app to ask for the
// active instance, so stories show Industria's
import industria from '../../instances/industria'
import { SCALE_MAX, SCALE_MIN } from '../../survey/scale'
import type { Answers } from '../../survey/scoring'
import { useSurveyStore } from '../../stores/survey'
import ScreenResult from './ScreenResult.vue'

// Answers that make `profile` win: its questions at the top of the scale
// (bottom for inverted ones), everything else neutral
function answersFor(profileId: string) {
  const answers: Answers = {}
  for (const world of industria.worlds) {
    for (const id of world.questions) answers[id] = 3
  }
  const profile = industria.profiles.find(item => item.id === profileId)!
  for (const { id, inverted } of profile.questions) {
    answers[id] = inverted ? SCALE_MIN : SCALE_MAX
  }
  return answers
}

// Closing the modal moves the store on (to "thanks"); reload the story to
// see it again
const meta = {
  title: 'Screens/Result',
  component: ScreenResult,
  tags: ['autodocs'],
  argTypes: {
    // Story-only arg (not a prop): drives the store answers
    profile: { control: 'inline-radio', options: industria.profiles.map(profile => profile.id) }
  },
  render: args => ({
    components: { ScreenResult },
    setup: () => {
      const store = useSurveyStore()
      // The preview shares one Pinia store across stories; re-run when the
      // `profile` control changes
      watchEffect(() => {
        store.reset()
        store.answers = answersFor(args.profile)
      })
      return { args }
    },
    // Keyed so changing the control remounts with a fresh modal
    template: `
      <div class="flex min-h-[calc(100vh-4rem)] flex-col">
        <ScreenResult :key="args.profile" />
      </div>
    `
  })
} satisfies Meta<{ profile: string }>

export default meta
type Story = StoryObj<typeof meta>

const storyFor = (profile: string): Story => ({ args: { profile } })

export const Imagina = storyFor('imagina')
export const Proyecta = storyFor('proyecta')
export const Innova = storyFor('innova')
export const Transforma = storyFor('transforma')
