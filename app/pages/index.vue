<script setup lang="ts">
/*
 * The whole experience lives on this page: it renders the screen for the
 * current step of the survey store. Each screen is keyed by the step index so
 * it remounts per step (fresh local state, and a clean hook for the GSAP
 * transitions later).
 */
const store = useSurveyStore()

useResponsePersistence()

// Worlds and splash sit on white; everything else on black
const surface = computed(() =>
  store.step.kind === 'splash' || store.step.kind === 'question' ? 'light' : 'dark'
)

// On mobile the white screens are full-bleed, without the tagline
const showTaglineOnMobile = computed(() => surface.value === 'dark')

// Move focus into the new screen so keyboard and screen reader users land on
// it: its main field if it has one, else its heading. Skipped on first load.
const main = useTemplateRef<HTMLElement>('main')
watch(() => store.stepIndex, async () => {
  await nextTick()
  const target = main.value?.querySelector<HTMLElement>('[data-autofocus]')
    ?? main.value?.querySelector<HTMLElement>('h1')
  target?.focus()
})
</script>

<template>
  <div
    class="relative flex min-h-dvh flex-col transition-colors duration-500"
    :class="surface === 'light' ? 'surface-light' : 'surface-dark'"
  >
    <AppHeader />

    <main
      ref="main"
      class="flex flex-1 flex-col px-6 py-10 pe-12 sm:px-24"
    >
      <ScreenIntro
        v-if="store.step.kind === 'intro'"
        :key="store.stepIndex"
      />
      <ScreenProfiling
        v-else-if="store.step.kind === 'profiling'"
        :key="store.stepIndex"
        :field-index="store.step.fieldIndex"
      />
      <ScreenSplash
        v-else-if="store.step.kind === 'splash'"
        :key="store.stepIndex"
      />
      <ScreenQuestion
        v-else-if="store.step.kind === 'question'"
        :key="store.stepIndex"
        :world-index="store.step.worldIndex"
        :question-index="store.step.questionIndex"
      />
      <ScreenResult
        v-else-if="store.step.kind === 'result'"
        :key="store.stepIndex"
      />
      <ScreenThanks
        v-else-if="store.step.kind === 'thanks'"
        :key="store.stepIndex"
      />
      <ScreenOutro
        v-else
        :key="store.stepIndex"
      />
    </main>

    <AppTagline
      class="px-6 pb-8"
      :class="{ 'max-md:hidden': !showTaglineOnMobile }"
    />

    <AppProgressRuler
      :progress="store.progress"
      :complete="store.finished"
      class="fixed end-3 top-1/2 -translate-y-1/2 sm:end-4"
    />
  </div>
</template>
