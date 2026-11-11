<script setup lang="ts">
// i18n-driven head: <html lang/dir>, hreflang and og:locale per locale
const localeHead = useLocaleHead()
const { t } = useI18n()
const { textKey } = useInstance()

useHead(() => ({
  htmlAttrs: localeHead.value.htmlAttrs ?? {},
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ...(localeHead.value.meta ?? [])
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    ...(localeHead.value.link ?? [])
  ]
}))

useSeoMeta({
  title: () => `${t(textKey('title'))} · ${t('app.tagline')}`,
  description: () => t(textKey('description')),
  ogTitle: () => t(textKey('title')),
  ogDescription: () => t(textKey('description'))
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
