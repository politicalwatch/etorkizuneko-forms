<script setup lang="ts">
// Position within the current world: answered + current dots are solid,
// upcoming ones pale.
const props = defineProps<{
  total: number
  // 0-based index of the current question
  current: number
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex items-center gap-1.5">
    <span
      v-for="index in props.total"
      :key="index"
      class="size-3 rounded-full transition-colors duration-300"
      :class="index - 1 <= props.current ? 'bg-brand-500' : 'bg-brand-200'"
      aria-hidden="true"
    />
    <span class="sr-only">
      {{ t('worlds.questionOf', { current: props.current + 1, total: props.total }) }}
    </span>
  </div>
</template>
