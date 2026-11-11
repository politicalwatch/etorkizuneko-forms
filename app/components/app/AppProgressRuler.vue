<script setup lang="ts">
/*
 * Vertical tick ruler on the right edge. Two groups of ticks with the
 * percentage in the gap between them; as progress grows, ticks turn magenta
 * from the center outwards. With `progress` null only the ticks are drawn;
 * `complete` lights them all, also without a percentage (survey finished).
 */
const props = withDefaults(defineProps<{
  // 0–1, or null to hide the percentage
  progress?: number | null
  // Ticks in each half
  ticks?: number
  // Every tick lit, no percentage
  complete?: boolean
}>(), {
  progress: null,
  ticks: 30,
  complete: false
})

const { t } = useI18n()

const percent = computed(() =>
  props.progress == null ? null : Math.round(Math.min(Math.max(props.progress, 0), 1) * 100)
)

// Ticks lit on each side of the center
const lit = computed(() => {
  if (props.complete) return props.ticks
  return percent.value == null ? 0 : Math.round((percent.value / 100) * props.ticks)
})

// Top half counts from the top edge, so the lit ones are the last `lit`
const isLitTop = (index: number) => index >= props.ticks - lit.value
const isLitBottom = (index: number) => index < lit.value
</script>

<template>
  <!--
    Proportions from the reference (1440px artboard): label ~16px with a cap
    height of ~2/3 of the tick width, ticks ~17px wide. Mobile is smaller.
  -->
  <div
    class="flex h-[55dvh] w-2 flex-col items-center md:w-4"
    :role="percent == null ? undefined : 'progressbar'"
    :aria-label="percent == null ? undefined : t('app.progress')"
    :aria-valuenow="percent ?? undefined"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-hidden="percent == null ? 'true' : undefined"
  >
    <div class="flex w-full flex-1 flex-col justify-between">
      <span
        v-for="index in ticks"
        :key="`top-${index}`"
        class="h-px w-full transition-colors duration-300"
        :class="isLitTop(index - 1) ? 'bg-brand-500' : 'bg-(--surface-fg)'"
      />
    </div>

    <!--
      Fixed-size slot (in em, so it scales with the label) that fits "100%":
      the ticks don't shift as the number grows, and the label is centered
      in the gap on both axes. Kept (empty) when there's no percentage.
    -->
    <div
      class="
        flex h-[2.75em] items-center justify-center text-[0.625rem] leading-none font-semibold
        text-brand-500 md:text-base
      "
    >
      <span
        v-if="percent != null"
        class="[writing-mode:vertical-rl]"
      >{{ percent }}%</span>
    </div>

    <div class="flex w-full flex-1 flex-col justify-between">
      <span
        v-for="index in ticks"
        :key="`bottom-${index}`"
        class="h-px w-full transition-colors duration-300"
        :class="isLitBottom(index - 1) ? 'bg-brand-500' : 'bg-(--surface-fg)'"
      />
    </div>
  </div>
</template>
