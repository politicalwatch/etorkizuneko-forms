import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { useSurveyStore } from '../../stores/survey'
import ScreenSplash from './ScreenSplash.vue'

// On the page, scrolling or the hint button moves on; here nothing does
const meta = {
  title: 'Screens/Splash',
  component: ScreenSplash,
  tags: ['autodocs'],
  globals: { surface: 'light' },
  render: () => ({
    components: { ScreenSplash },
    setup: () => {
      // The preview shares one Pinia store across stories
      useSurveyStore().reset()
    },
    template: '<div class="flex min-h-[calc(100vh-4rem)] flex-col"><ScreenSplash /></div>'
  })
} satisfies Meta<typeof ScreenSplash>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
