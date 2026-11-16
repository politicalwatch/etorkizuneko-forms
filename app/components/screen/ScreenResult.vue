<script setup lang="ts">
// Result profile, shown as a modal over the black screen. Only the × moves on
// to the thanks step: not dismissible, so a stray Esc or backdrop click can't
// skip the profile for good.
const { t, locale } = useI18n()
const store = useSurveyStore()
const { textKey } = useInstance()
const toast = useToast()

const open = ref(true)
watch(open, (isOpen) => {
  if (!isOpen) store.next()
})

const key = computed(() => textKey(`profiles.${store.result}`))
const name = computed(() => t(`${key.value}.name`))

/*
 * Sharing: "Copy link" copies the profile's share page, whose link preview
 * is the profile card. WhatsApp gets the card image itself on phones that
 * can share files (native share sheet); elsewhere, wa.me with the message
 * and that same link, so the card shows as its preview.
 */
const { pageUrl, cardUrl } = useProfileShare(() => store.result ?? '', locale)
const message = computed(() => t(textKey('share.message'), { link: pageUrl.value }))

async function copyLink() {
  await navigator.clipboard.writeText(pageUrl.value)
  toast.add({ title: t('result.linkCopied'), icon: 'i-lucide-check' })
}

// Fetched ahead: navigator.share must run right after the click, while the
// browser still counts it as a user gesture
const card = shallowRef<File>()
onMounted(async () => {
  const canShareFiles = typeof navigator.canShare === 'function'
    && window.matchMedia('(pointer: coarse)').matches
  if (!canShareFiles || !cardUrl.value) return

  try {
    const blob = await $fetch<Blob>(cardUrl.value, { responseType: 'blob' })
    const file = new File([blob], cardUrl.value.split('/').pop()!, { type: 'image/jpeg' })
    if (navigator.canShare({ files: [file] })) card.value = file
  } catch {
    // No card: falls back to the link
  }
})

async function shareOnWhatsApp() {
  if (card.value) {
    try {
      await navigator.share({ files: [card.value], text: message.value })
    } catch {
      // Cancelled by the user: nothing to do
    }
    return
  }

  window.open(`https://wa.me/?text=${encodeURIComponent(message.value)}`, '_blank', 'noopener')
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
        <div class="flex flex-col gap-3">
          <UButton
            size="xl"
            block
            icon="i-simple-icons-whatsapp"
            :label="t('result.whatsapp')"
            @click="shareOnWhatsApp"
          />
          <UButton
            size="xl"
            block
            variant="surface"
            icon="i-lucide-link"
            :label="t('result.copyLink')"
            @click="copyLink"
          />
        </div>
      </template>
    </AppModal>
  </section>
</template>
