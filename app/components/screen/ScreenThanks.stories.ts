import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { useSurveyStore } from '../../stores/survey'
import ScreenThanks from './ScreenThanks.vue'

// Submitting, "No, gracias" or dismissing moves the store on (to the outro); reload the
// story to see it again
const meta = {
  title: 'Screens/Thanks',
  component: ScreenThanks,
  tags: ['autodocs'],
  render: () => ({
    components: { ScreenThanks },
    setup: () => {
      // The preview shares one Pinia store across stories
      useSurveyStore().reset()
    },
    template: '<div class="flex min-h-[calc(100vh-4rem)] flex-col"><ScreenThanks /></div>'
  })
} satisfies Meta<typeof ScreenThanks>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
