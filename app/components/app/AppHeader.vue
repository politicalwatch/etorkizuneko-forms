<script setup lang="ts">
const { t } = useI18n()
const { learnMoreUrl } = useRuntimeConfig().public
</script>

<template>
  <header class="flex items-start justify-between gap-4 px-4 pt-4 sm:px-6">
    <AppLogo />

    <div class="flex items-center gap-1.5">
      <!-- Hidden until NUXT_PUBLIC_LEARN_MORE_URL is configured -->
      <UButton
        v-if="learnMoreUrl"
        :to="learnMoreUrl"
        target="_blank"
        :label="t('app.learnMore')"
        variant="surface"
      />
      <AppLocaleSwitcher />
    </div>
  </header>
</template>
