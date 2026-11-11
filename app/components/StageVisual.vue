<script setup lang="ts">
/*
 * PLACEHOLDER for the central animated visual (the stippled magenta circle
 * and the per-world shapes). It will become a video / image-sequence
 * animation; for now it only reserves the space with a rough CSS sketch so
 * layouts can be built around it.
 */
withDefaults(defineProps<{
  variant?: 'circle' | 'world'
}>(), {
  variant: 'circle'
})
</script>

<template>
  <div
    class="pointer-events-none relative aspect-square w-full max-w-72"
    aria-hidden="true"
  >
    <template v-if="variant === 'circle'">
      <span class="absolute inset-[8%] rounded-full border-[6px] border-brand-500 opacity-90" />
      <span class="absolute top-[22%] left-[55%] size-[16%] rounded-full bg-brand-500" />
      <span class="absolute top-[58%] left-[28%] size-[12%] rounded-full bg-brand-500" />
    </template>

    <span
      v-else
      class="absolute inset-x-[5%] inset-y-[30%] rounded-[50%] border-14 border-brand-500/80"
    />
  </div>
</template>
