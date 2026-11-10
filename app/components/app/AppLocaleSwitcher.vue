<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { t, locale, locales, setLocale } = useI18n()

const items = computed<DropdownMenuItem[]>(() =>
  locales.value.map(({ code, name }) => ({
    label: name ?? code,
    type: 'checkbox' as const,
    checked: code === locale.value,
    onSelect: () => setLocale(code)
  }))
)
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end' }"
  >
    <UButton
      :label="locale.toUpperCase()"
      :aria-label="t('app.language')"
      variant="surface"
      class="min-w-12"
    />
  </UDropdownMenu>
</template>
