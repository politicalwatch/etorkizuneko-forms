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
    { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
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
