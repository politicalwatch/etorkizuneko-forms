import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { useSurveyStore } from '../../stores/survey'
import ScreenIntro from './ScreenIntro.vue'

const meta = {
  title: 'Screens/Intro',
  component: ScreenIntro,
  tags: ['autodocs'],
  render: () => ({
    components: { ScreenIntro },
    setup: () => {
      // The preview shares one Pinia store across stories
      useSurveyStore().reset()
    },
    // Screens grow inside the page's flex column
    template: '<div class="flex min-h-[calc(100vh-4rem)] flex-col"><ScreenIntro /></div>'
  })
} satisfies Meta<typeof ScreenIntro>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
