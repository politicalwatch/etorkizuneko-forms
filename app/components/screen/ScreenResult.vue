<script setup lang="ts">
// Result profile, shown as a modal over the black screen. Only the × moves on
// to the thanks step: not dismissible, so a stray Esc or backdrop click can't
// skip the profile for good.
const { t } = useI18n()
const store = useSurveyStore()
const { textKey } = useInstance()
const toast = useToast()

const open = ref(true)
watch(open, (isOpen) => {
  if (!isOpen) store.next()
})

const key = computed(() => textKey(`profiles.${store.result}`))
const name = computed(() => t(`${key.value}.name`))

async function share() {
  const data = {
    title: t(textKey('title')),
    text: t(textKey('shareText'), { profile: name.value }),
    url: window.location.origin
  }

  if (navigator.share) {
    try {
      await navigator.share(data)
    } catch {
      // Cancelled by the user: nothing to do
    }
    return
  }

  await navigator.clipboard.writeText(`${data.text} ${data.url}`)
  toast.add({ title: t('result.linkCopied'), icon: 'i-lucide-check' })
}
</script>

<template>
  <section class="flex-1">
    <AppModal
      v-model:open="open"
      :title="`${t('result.eyebrow')}: ${name}`"
      closable
      :dismissible="false"
    >
      <div>
        <p class="text-2xl">
          {{ t('result.eyebrow') }}
        </p>
        <h2 class="text-6xl font-semibold tracking-tight">
          {{ name }}
        </h2>
      </div>

      <p class="text-xl leading-snug">
        {{ t(`${key}.body`) }}
      </p>
      <p class="text-xl leading-snug text-brand-500 italic">
        {{ t(`${key}.gaze`) }}
      </p>

      <template #footer>
        <UButton
          size="xl"
          block
          :label="t('result.share')"
          @click="share"
        />
      </template>
    </AppModal>
  </section>
</template>
