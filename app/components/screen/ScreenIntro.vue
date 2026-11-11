<script setup lang="ts">
const { t } = useI18n()
const store = useSurveyStore()
const { textKey } = useInstance()
</script>

<template>
  <section class="flex flex-1 flex-col justify-center gap-10">
    <div>
      <h1
        tabindex="-1"
        class="text-[clamp(4.5rem,14vw,12.5rem)] leading-[0.85] font-bold sm:-ms-[0.09em] uppercase outline-none"
      >
        {{ t(textKey('title')) }}
      </h1>
      <p class="mt-4 text-3xl sm:mt-2 sm:text-[2.75rem]">
        {{ t(textKey('intro.subtitle')) }}
      </p>
    </div>

    <p class="max-w-sm text-xl sm:max-w-92 sm:leading-[1.1]">
      {{ t(textKey('intro.body')) }}
    </p>

    <UButton
      size="xl"
      :label="t('intro.cta')"
      class="w-full sm:w-92"
      @click="store.next()"
    />
  </section>
</template>
