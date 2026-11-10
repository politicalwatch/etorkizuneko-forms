<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <p class="text-center text-sm leading-tight font-semibold text-brand-500 uppercase sm:text-xs">
    {{ t('app.tagline') }}<br>{{ t('app.topic') }}
  </p>
</template>
