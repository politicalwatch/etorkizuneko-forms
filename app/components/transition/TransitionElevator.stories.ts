import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { ref } from 'vue'
import TransitionElevator from './TransitionElevator.vue'

// Each click swaps the keyed child; the heading around it stays still
const meta = {
  title: 'Transitions/Elevator',
  component: TransitionElevator,
  tags: ['autodocs'],
  render: () => ({
    components: { TransitionElevator },
    setup: () => ({ floor: ref(1) }),
    template: `
      <div class="relative flex items-start justify-between gap-8 p-8">
        <TransitionElevator>
          <div :key="floor" class="flex flex-col gap-4">
            <p class="text-6xl font-bold uppercase">Floor {{ floor }}</p>
            <button class="w-32 rounded-full bg-brand-500 py-2 text-white" @click="floor++">Next</button>
          </div>
        </TransitionElevator>
        <p class="text-6xl font-bold uppercase">Still</p>
      </div>
    `
  })
} satisfies Meta<typeof TransitionElevator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
