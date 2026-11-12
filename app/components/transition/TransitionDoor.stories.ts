import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { ref } from 'vue'
import TransitionDoor from './TransitionDoor.vue'

// Each click swaps both keyed children: hinged left and right, like the
// worlds' question column and title
const meta = {
  title: 'Transitions/Door',
  component: TransitionDoor,
  tags: ['autodocs'],
  render: () => ({
    components: { TransitionDoor },
    setup: () => ({ room: ref(1) }),
    template: `
      <div class="relative flex items-center justify-between gap-8 p-8">
        <TransitionDoor hinge="left">
          <div :key="room" class="flex w-80 flex-col gap-4">
            <p class="text-xl">Question block {{ room }}, hinged left</p>
            <button class="w-32 rounded-full bg-brand-500 py-2 text-white" @click="room++">Next</button>
          </div>
        </TransitionDoor>
        <TransitionDoor hinge="right">
          <p :key="room" class="w-min text-end text-6xl font-bold uppercase">Room {{ room }}</p>
        </TransitionDoor>
      </div>
    `
  })
} satisfies Meta<typeof TransitionDoor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
