<script setup lang="ts">
// Interstitial before and after the worlds. Scrolling moves on (the page runs
// that transition, see useScrollAdvance); the scroll hint is also a button,
// for whoever doesn't scroll.
const emit = defineEmits<{
  continue: []
}>()

const { t } = useI18n()
</script>

<template>
  <section class="relative flex flex-1 items-center justify-center">
    <!--
      Title with the animation centered on it. On mobile the design has them
      at ~40% of the screen height, above the center: the bottom margin lifts
      the block by half of it.
    -->
    <div class="relative max-sm:mb-[28dvh]">
      <!-- max-w in em breaks the tagline into the design's three lines -->
      <h1
        tabindex="-1"
        class="
          max-w-[9em] text-center text-[clamp(2.75rem,10vw,3.75rem)] leading-[0.95]
          font-bold uppercase outline-none
        "
      >
        {{ t('splash.title') }}
      </h1>

      <!--
        Smaller than the title, as in the mobile design (~47% of the width).
        The size goes on a wrapper: StageVisual fills it (its w-full would win
        over a width class passed to it).
      -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-[47vw] shrink-0 sm:w-56">
          <StageVisual />
        </div>
      </div>
    </div>

    <button
      type="button"
      class="
        absolute bottom-0 left-1/2 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-3
        whitespace-nowrap
        rounded-lg px-3 py-2 text-xl text-(--surface-muted) outline-brand-500
        hover:text-(--surface-fg)
        focus-visible:outline-2
      "
      @click="emit('continue')"
    >
      {{ t('splash.scrollHint') }}
      <span
        class="flex flex-col items-center -space-y-0.5"
        aria-hidden="true"
      >
        <UIcon
          v-for="n in 3"
          :key="n"
          name="i-lucide-arrow-down"
          class="size-5"
        />
      </span>
    </button>
  </section>
</template>
