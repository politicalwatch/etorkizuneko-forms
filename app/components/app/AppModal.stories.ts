import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { ref } from 'vue'
import UButton from '@nuxt/ui/components/Button.vue'
import AppModal from './AppModal.vue'

const meta = {
  title: 'App/Modal',
  component: AppModal,
  tags: ['autodocs'],
  args: {
    title: 'Tu perfil: Imagina',
    closable: true,
    dismissible: true
  },
  render: args => ({
    components: { AppModal, UButton },
    setup: () => ({ args, open: ref(true) }),
    template: `
      <UButton label="Open modal" @click="open = true" />
      <AppModal v-bind="args" v-model:open="open">
        <div>
          <p class="text-2xl">Tu perfil</p>
          <h2 class="text-6xl font-semibold tracking-tight">Imagina</h2>
        </div>
        <p class="text-xl leading-snug">
          Crees que la industria puede ser mucho más que fabricar productos. La imaginas como un lugar
          donde explorar ideas, desarrollar tu creatividad y encontrar nuevas maneras de hacer las cosas.
        </p>
        <p class="text-xl leading-snug text-brand-500 italic">
          Tu mirada conecta la industria con la creatividad y las posibilidades de futuro.
        </p>
        <template #footer>
          <UButton size="xl" block label="Compartir" />
        </template>
      </AppModal>
    `
  })
} satisfies Meta<typeof AppModal>

export default meta
type Story = StoryObj<typeof meta>

export const Closable: Story = {}

export const WithoutCloseButton: Story = {
  args: { closable: false }
}
