<script setup lang="ts">
/*
 * Share page of a result profile (/profile/<id>?lang=<code>). It exists for
 * its preview: WhatsApp and other link previews read the og tags rendered
 * here on the server, with the profile's card as the image. People who open
 * it go straight on to the survey, in the language it was shared in.
 */
// Switch to the shared language before rendering, so the whole page (<html
// lang>, og tags) is in it
definePageMeta({
  middleware: async (to) => {
    const { $i18n } = useNuxtApp()
    const lang = $i18n.locales.value.find(({ code }) => code === to.query.lang)?.code
    if (lang && lang !== $i18n.locale.value) await $i18n.setLocale(lang)
  }
})

const route = useRoute()
const { t, locale } = useI18n()
const { textKey } = useInstance()

const id = String(route.params.id)
const { profile, pageUrl, cardUrl } = useProfileShare(id, locale)

if (!profile.value) {
  await navigateTo('/', { replace: true })
} else {
  const name = t(textKey(`profiles.${id}.name`))

  useSeoMeta({
    ogTitle: () => t(textKey('share.question')),
    ogDescription: () => t(textKey('share.description')),
    ogUrl: () => pageUrl.value,
    ogImage: {
      url: cardUrl.value,
      type: 'image/jpeg',
      width: 1080,
      height: 1293,
      alt: `${t('result.eyebrow')}: ${name}`
    },
    twitterCard: 'summary_large_image'
  })

  onMounted(() => navigateTo('/', { replace: true }))
}
</script>

<template>
  <main class="surface-dark flex min-h-dvh items-center justify-center bg-ink p-6">
    <!-- Only seen without JavaScript -->
    <UButton
      to="/"
      size="xl"
      :label="t('intro.cta')"
    />
  </main>
</template>
