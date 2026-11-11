<script setup lang="ts">
// Interstitial before and after the worlds. For now it moves on by itself
// after a pause; a scroll-driven GSAP transition will replace the timer later
// (hence the scroll hint).
const SPLASH_DURATION_MS = 2500

const { t } = useI18n()
const store = useSurveyStore()

let timer: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  timer = setTimeout(() => store.next(), SPLASH_DURATION_MS)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section class="relative flex flex-1 items-center justify-center">
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

    <div class="absolute inset-0 flex items-center justify-center">
      <StageVisual class="w-3/4 sm:w-56" />
    </div>

    <p class="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 text-xl text-(--surface-muted)">
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
    </p>
  </section>
</template>
