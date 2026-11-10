<script setup lang="ts">
/*
 * White rounded card with a soft glow, used for the result and thanks
 * screens. Built on UModal (focus trap, Esc, portal, a11y title); the content
 * is fully ours. The card is a light surface (surface-light), so form fields
 * inside it pick the right colors.
 */
const open = defineModel<boolean>('open', { default: false })

withDefaults(defineProps<{
  // Accessible name of the dialog (visually hidden; show your own heading)
  title: string
  // Show the × button
  closable?: boolean
  // Allow closing with Esc / click outside
  dismissible?: boolean
}>(), {
  closable: false,
  dismissible: true
})

const { t } = useI18n()
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :dismissible="dismissible"
    :ui="{
      overlay: 'bg-ink/40',
      content: 'surface-light bg-paper text-ink w-[calc(100vw-2rem)] max-w-md divide-y-0 rounded-[2rem] shadow-[0_0_28px_rgba(255,255,255,0.45)] ring-0'
    }"
  >
    <template #content="{ close }">
      <div class="relative flex flex-col gap-6 p-6 sm:p-8">
        <UButton
          v-if="closable"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xl"
          :aria-label="t('app.close')"
          class="absolute end-3 top-3 text-ink"
          @click="close"
        />

        <slot />

        <div
          v-if="$slots.footer"
          class="mt-4"
        >
          <slot name="footer" />
        </div>
      </div>
    </template>
  </UModal>
</template>
