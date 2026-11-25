<script setup lang="ts">
// Optional email to join the Agertokiak community (never linked to the
// answers). Submitting it, "No, gracias" or dismissing the modal (Esc /
// backdrop) moves on to the outro. Leaving the email needs the privacy
// policy accepted and being 14 or older confirmed (two boxes, unticked by
// default, GDPR); a short data protection notice (controller, purpose, legal
// basis, rights) sits right before the submit button, as the DPO asked. The
// email is sent on its own, to a table apart from the answers
// (server/api/emails.post.ts); a failed send shows an error and stays open.
const { t } = useI18n()
const store = useSurveyStore()

const open = ref(true)
watch(open, (isOpen) => {
  if (!isOpen) store.next()
})

const footnoteId = useId()

// Fields of the data protection notice, in the DPO's order
const LEGAL_ITEMS = ['controller', 'purpose', 'basis', 'rights'] as const

const email = ref('')
const consent = ref(false)
const atLeast14 = ref(false)
const isValid = computed(() => consent.value && atLeast14.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

const sending = ref(false)
const failed = ref(false)

async function submit() {
  if (!isValid.value || sending.value) return
  sending.value = true
  failed.value = false
  try {
    await $fetch('/api/emails', { method: 'POST', body: { email: email.value.trim(), consent: true, atLeast14: true } })
    open.value = false
  } catch (error) {
    console.error('Could not save the email', error)
    failed.value = true
  } finally {
    sending.value = false
  }
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
                  :to="PRIVACY_POLICY_PATH"
                  target="_blank"
                  hreflang="es"
                  class="text-ink underline underline-offset-4"
                >{{ t('thanks.privacyPolicy') }}<span class="sr-only"> {{ t('app.newTab') }}</span></ULink>
              </template>
            </i18n-t>
          </template>
        </UCheckbox>

        <UCheckbox
          v-model="atLeast14"
          size="xl"
          :label="t('thanks.age')"
          class="-mt-4"
        />

        <!-- Data protection notice: must be read before submitting, hence above the button -->
        <div class="flex flex-col gap-1 text-xs leading-snug">
          <p>
            <template
              v-for="key in LEGAL_ITEMS"
              :key="key"
            >
              <strong>{{ t(`thanks.legal.${key}.label`) }}:</strong>
              {{ ' ' }}
              <i18n-t
                :keypath="`thanks.legal.${key}.text`"
                scope="global"
              >
                <template #email>
                  <ULink
                    :href="`mailto:${DATA_RIGHTS_EMAIL}`"
                    class="text-ink underline underline-offset-4"
                  >{{ DATA_RIGHTS_EMAIL }}</ULink>
                </template>
              </i18n-t>
              {{ ' ' }}
            </template>
          </p>
          <i18n-t
            keypath="thanks.legal.more"
            tag="p"
            scope="global"
          >
            <template #policy>
              <ULink
                :to="PRIVACY_POLICY_PATH"
                target="_blank"
                hreflang="es"
                class="text-ink underline underline-offset-4"
              >{{ t('thanks.privacyPolicy') }}<span class="sr-only"> {{ t('app.newTab') }}</span></ULink>
            </template>
          </i18n-t>
        </div>

        <UButton
          type="submit"
          size="xl"
          :label="t('thanks.submit')"
          :disabled="!isValid"
          :loading="sending"
          class="mt-2 self-center px-10"
        />

        <!-- Always rendered so screen readers announce the text when it appears -->
        <p
          role="alert"
          class="-mt-3 text-center text-sm font-semibold empty:hidden"
        >
          {{ failed ? t('thanks.error') : '' }}
        </p>

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
