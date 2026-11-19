import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { watchEffect } from 'vue'
import { STAGE_LOOP_COUNT, useStage } from '../composables/useStage'
import StageVisual from './StageVisual.vue'

// The animation is app-wide: `loop` is what the page sets per step. Change it
// to play the transitions (moving on turns around and plays through; moving
// back cuts).
const loops = Array.from({ length: STAGE_LOOP_COUNT }, (_, index) => index)
const labels = Object.fromEntries(loops.map(index => [
  index,
  index === 0 ? 'Opening splash' : index === STAGE_LOOP_COUNT - 1 ? 'Closing splash' : `World ${index}`
]))

const meta = {
  title: 'Survey/StageVisual',
  component: StageVisual,
  tags: ['autodocs'],
  globals: { surface: 'light' },
  argTypes: {
    loop: { control: 'select', options: loops, labels }
  },
  args: { loop: 0 },
  render: args => ({
    components: { StageVisual },
    setup: () => {
      const stage = useStage()
      watchEffect(() => stage.setTarget(args.loop))
      return {}
    },
    template: '<StageVisual class="mx-auto" />'
  })
} satisfies Meta<{ loop: number }>

export default meta
type Story = StoryObj<typeof meta>

export const OpeningSplash: Story = {}

export const World4: Story = {
  args: { loop: 4 }
}
