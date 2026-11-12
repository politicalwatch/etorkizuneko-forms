<script setup lang="ts">
import type { Step } from '#shared/survey/steps'

/*
 * The whole experience lives on this page: it renders the screen for the
 * current step of the survey store. Each screen is keyed by the step index so
 * it remounts per step (fresh local state, and a clean hook for transitions),
 * except the profiling screen and each world's: they stay across their
 * fields / questions and swap only those (TransitionElevator).
 */
const store = useSurveyStore()

const screenKey = computed(() => {
  const step = store.step
  if (step.kind === 'profiling') return 'profiling'
  if (step.kind === 'question') return `world-${step.worldIndex}`
  return store.stepIndex
})

useResponsePersistence()

// Worlds and splash sit on white; everything else on black
const surfaceOf = (step: Step) =>
  step.kind === 'splash' || step.kind === 'question' ? 'surface-light' : 'surface-dark'

// On mobile the white screens are full-bleed, without the tagline
const taglineClass = (step: Step) =>
  ['px-6 pb-8', { 'max-md:hidden': surfaceOf(step) === 'surface-light' }]

// The screen's box; the incoming screen of a scroll transition uses it too
const screenClass = 'flex flex-1 flex-col px-6 py-10 pe-12 sm:px-24'

/*
 * Leaving a splash is scroll-driven: the next screen rises over it as the
 * person scrolls (useScrollAdvance). That screen is laid out in a cover with
 * the same boxes as the page, and becomes the real one when the move ends.
 * The result is a modal of its own, so only its black surface rises, as in
 * the design.
 */
const incoming = computed(() =>
  store.step.kind === 'splash' && store.nextStep ? store.nextStep : null
)
const cover = useTemplateRef<HTMLElement>('cover')
const { advance } = useScrollAdvance(cover, () => store.next())

// The page color fades into a splash's white; leaving a splash, the cover has
// already brought the new color in
const fadeSurface = computed(() => store.step.kind === 'splash')

// The page clips its overflow: content moving in from below mustn't add a
// scrollbar meanwhile

// Move focus into the new screen so keyboard and screen reader users land on
// it: its main field if it has one, else its heading. Skipped on first load.
// Content still on its way out is inert: skip it.
const main = useTemplateRef<HTMLElement>('main')
const find = (selector: string) =>
  [...main.value?.querySelectorAll<HTMLElement>(selector) ?? []].find(el => !el.closest('[inert]'))
watch(() => store.stepIndex, async () => {
  await nextTick()
  const target = find('[data-autofocus]') ?? find('h1')
  target?.focus()
})
</script>

<template>
  <div
    class="relative flex min-h-dvh flex-col overflow-clip"
    :class="[surfaceOf(store.step), { 'transition-colors duration-500': fadeSurface }]"
  >
    <AppHeader class="relative z-20" />

    <main
      ref="main"
      :class="screenClass"
    >
      <ScreenStep
        :key="screenKey"
        :step="store.step"
        @continue="advance"
      />
    </main>

    <AppTagline
      class="relative z-20"
      :class="taglineClass(store.step)"
    />

    <AppProgressRuler
      :progress="store.progress"
      :complete="store.finished"
      class="fixed end-3 top-1/2 z-20 -translate-y-1/2 sm:end-4"
    />

    <!-- Header and tagline stay on top: invisible copies only hold their space -->
    <div
      v-if="incoming"
      ref="cover"
      class="fixed inset-0 z-10 flex flex-col"
      :class="surfaceOf(incoming)"
      inert
    >
      <AppHeader class="invisible" />
      <div :class="screenClass">
        <ScreenStep
          v-if="incoming.kind !== 'result'"
          :step="incoming"
        />
      </div>
      <AppTagline
        class="invisible"
        :class="taglineClass(incoming)"
      />
    </div>
  </div>
</template>
