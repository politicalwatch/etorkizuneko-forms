<script setup lang="ts">
const { t } = useI18n()
const store = useSurveyStore()
const { textKey } = useInstance()
</script>

<template>
  <!-- A size container: the title is capped to its width (cqi) -->
  <section class="@container flex flex-1 flex-col justify-center gap-10">
    <div>
      <!--
        "INDUSTRIA" is ~5.2em wide: 18.5cqi fills the column without
        overflowing. From sm up, no bigger than designed (14vw, max 12.5rem).
      -->
      <h1
        tabindex="-1"
        class="text-[18.5cqi] sm:text-[min(14vw,18.5cqi,12.5rem)] leading-[0.85] font-bold sm:-ms-[0.09em] uppercase outline-none"
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

    <!-- Without saving, the survey can't start: the message takes the button's place -->
    <p
      v-if="store.saveUnavailable"
      class="max-w-sm text-xl font-semibold text-primary sm:max-w-92 sm:leading-[1.1]"
    >
      {{ t('intro.unavailable') }}
    </p>
    <UButton
      v-else
      size="xl"
      :label="t('intro.cta')"
      class="w-full sm:w-92"
      @click="store.next()"
    />
  </section>
</template>
