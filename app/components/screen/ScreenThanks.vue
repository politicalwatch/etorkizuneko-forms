<script setup lang="ts">
// Optional email to join the Agertokiak community (never linked to the
// answers). Submitting it, "No, gracias" or dismissing the modal (Esc /
// backdrop) moves on to the outro. Leaving the
// email needs the privacy policy accepted (unticked by default, GDPR); the
// time of consent is saved with it.
const { t, locale } = useI18n()
const store = useSurveyStore()

const open = ref(true)
watch(open, (isOpen) => {
  if (!isOpen) store.next()
})

const footnoteId = useId()
const email = ref(store.email)
const consent = ref(store.emailConsentAt != null)
const isValid = computed(() => consent.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

function submit() {
  if (!isValid.value) return
  store.email = email.value.trim()
  store.emailConsentAt = new Date().toISOString()
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

        <div class="flex flex-col gap-4 text-xl leading-snug">
          <p>{{ t('thanks.body') }}</p>
          <p class="font-semibold">
            {{ t('thanks.cta') }}
          </p>
        </div>

        <UInput
          v-model="email"
          type="email"
          autocomplete="email"
          :aria-label="t('thanks.emailLabel')"
          :placeholder="t('thanks.emailPlaceholder')"
          :aria-describedby="footnoteId"
          :ui="{ base: 'h-12' }"
        />

        <UCheckbox
          v-model="consent"
          size="xl"
          class="-mt-2"
        >
          <template #label>
            <!-- New tab: leaving the page would lose the response -->
            <i18n-t
              keypath="thanks.consent"
              scope="global"
            >
              <template #policy>
                <ULink
                  :to="privacyPolicyUrl(locale)"
                  target="_blank"
                  class="text-ink underline underline-offset-4"
                >{{ t('thanks.privacyPolicy') }}<span class="sr-only"> {{ t('app.newTab') }}</span></ULink>
              </template>
            </i18n-t>
          </template>
        </UCheckbox>

        <UButton
          type="submit"
          size="xl"
          :label="t('thanks.submit')"
          :disabled="!isValid"
          class="mt-2 self-center px-10"
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

        <!-- Explains the asterisk in thanks.cta; also read with the email field -->
        <p
          :id="footnoteId"
          class="text-xs leading-tight"
        >
          {{ t('thanks.footnote') }}
        </p>
      </form>
    </AppModal>
  </section>
</template>
