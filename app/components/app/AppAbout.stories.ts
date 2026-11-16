import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { ref } from 'vue'
import UButton from '@nuxt/ui/components/Button.vue'
import AppAbout from './AppAbout.vue'

// Opened by the header "Saber más" button; switch the locale to see eu/en
const meta = {
  title: 'App/About',
  component: AppAbout,
  tags: ['autodocs'],
  render: () => ({
    components: { AppAbout, UButton },
    setup: () => ({ open: ref(true) }),
    template: `
      <UButton label="Open modal" @click="open = true" />
      <AppAbout v-model:open="open" />
    `
  })
} satisfies Meta<typeof AppAbout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
