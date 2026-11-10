<script setup lang="ts">
// i18n-driven head: <html lang/dir>, hreflang and og:locale per locale
const localeHead = useLocaleHead()
const { t } = useI18n()

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
  title: () => `${t('app.title')} · ${t('app.tagline')}`,
  description: () => t('app.description'),
  ogTitle: () => t('app.title'),
  ogDescription: () => t('app.description')
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
