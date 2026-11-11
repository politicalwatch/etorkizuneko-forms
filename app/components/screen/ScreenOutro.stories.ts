import type { Meta, StoryObj } from '@nuxtjs/storybook'
import ScreenOutro from './ScreenOutro.vue'

const meta = {
  title: 'Screens/Outro',
  component: ScreenOutro,
  tags: ['autodocs'],
  render: () => ({
    components: { ScreenOutro },
    template: '<div class="flex min-h-[calc(100vh-4rem)] flex-col"><ScreenOutro /></div>'
  })
} satisfies Meta<typeof ScreenOutro>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
