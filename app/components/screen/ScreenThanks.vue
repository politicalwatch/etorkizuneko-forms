<script setup lang="ts">
// Optional email to take part in the experience. Submitting it, "No, gracias"
// or dismissing the modal (Esc / backdrop) moves on to the outro.
const { t } = useI18n()
const store = useSurveyStore()

const open = ref(true)
watch(open, (isOpen) => {
  if (!isOpen) store.next()
})

const email = ref(store.email)
const isValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

function submit() {
  if (!isValid.value) return
  store.email = email.value.trim()
  open.value = false
}
</script>

<template>
  <section class="flex-1">
    <AppModal
      v-model:open="open"
      :title="t('thanks.title')"
    >
      <form
        class="flex flex-col gap-6"
        novalidate
        @submit.prevent="submit"
      >
        <h2 class="text-6xl leading-[0.95] font-semibold uppercase">
          {{ t('thanks.title') }}
        </h2>

        <i18n-t
          keypath="thanks.body"
          tag="p"
          scope="global"
          class="text-xl leading-snug"
        >
          <template #amount>
            <strong>{{ t('thanks.amount') }}</strong>
          </template>
        </i18n-t>

        <UInput
          v-model="email"
          type="email"
          autocomplete="email"
          :aria-label="t('thanks.emailLabel')"
          :placeholder="t('thanks.emailPlaceholder')"
          :ui="{ base: 'h-12' }"
        />

        <UButton
          type="submit"
          size="xl"
          block
          :label="t('thanks.submit')"
          :disabled="!isValid"
          class="mt-8"
        />

        <!-- Visible way to skip: the email is optional -->
        <UButton
          variant="link"
          color="neutral"
          size="lg"
          :label="t('thanks.skip')"
          class="-mt-5 self-center text-ink underline underline-offset-4"
          @click="open = false"
        />
      </form>
    </AppModal>
  </section>
</template>
