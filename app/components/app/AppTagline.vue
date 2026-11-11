<script setup lang="ts">
const { t } = useI18n()
const { textKey } = useInstance()
</script>

<template>
  <p class="text-center text-sm leading-tight font-semibold text-brand-500 uppercase sm:text-xs">
    {{ t('app.tagline') }}<br>{{ t(textKey('topic')) }}
  </p>
</template>
