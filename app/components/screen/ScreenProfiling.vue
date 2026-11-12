<script setup lang="ts">
// The profiling section. It stays put from one field to the next (the page
// keeps it mounted); only the field rises out and the next one in.
defineProps<{ fieldIndex: number }>()

const { t } = useI18n()
</script>

<template>
  <section class="relative flex flex-1 flex-col justify-between gap-12 md:flex-row-reverse md:items-start md:justify-between md:pe-8 md:pt-21">
    <h1
      tabindex="-1"
      class="
        w-min text-[2.75rem] leading-none font-semibold uppercase outline-none
        md:text-end md:text-6xl md:leading-[0.96] md:font-bold
      "
    >
      {{ t('profiling.title') }}
    </h1>

    <TransitionElevator>
      <ProfilingField
        :key="fieldIndex"
        :field-index="fieldIndex"
      />
    </TransitionElevator>
  </section>
</template>
