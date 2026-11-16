<script setup lang="ts">
const { t } = useI18n()

const aboutOpen = ref(false)
</script>

<template>
  <header class="flex items-start justify-between gap-4 px-4 pt-4 sm:px-6">
    <AppLogo />

    <div class="flex items-center gap-1.5">
      <UButton
        :label="t('app.learnMore')"
        variant="surface"
        aria-haspopup="dialog"
        @click="aboutOpen = true"
      />
      <AppLocaleSwitcher />
    </div>

    <AppAbout v-model:open="aboutOpen" />
  </header>
</template>
