<script setup lang="ts">
const { t } = useI18n()
const { textKey } = useInstance()
</script>

<template>
  <!-- Just the instance title, typeset like the intro's -->
  <section class="flex flex-1 flex-col items-center justify-center">
    <h1
      tabindex="-1"
      class="
        self-start text-[clamp(4.5rem,14vw,12.5rem)] leading-[0.85] font-bold uppercase
        outline-none md:self-center
      "
    >
      {{ t(textKey('title')) }}
    </h1>
  </section>
</template>
