<script setup lang="ts">
// Agertokiak lockup: magenta square with the wordmark knocked out in the
// surface background color (black on dark screens, white on light ones).
</script>

<template>
  <span
    class="
      grid size-14 grid-rows-[auto_auto_1fr] bg-brand-500 p-1 text-[0.7rem]
      leading-none font-medium text-(--surface-bg) sm:size-16 sm:text-xs
    "
    role="img"
    aria-label="Agertokiak"
  >
    <span
      class="text-end"
      aria-hidden="true"
    >AGER–</span>
    <span aria-hidden="true">TOKI–</span>
    <span
      class="self-end text-end"
      aria-hidden="true"
    >AK</span>
  </span>
</template>
