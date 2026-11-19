<script setup lang="ts">
import type { Step } from '#shared/survey/steps'

/*
 * The whole experience lives on this page: it renders the screen for the
 * current step of the survey store. Each screen is keyed by the step index so
 * it remounts per step (fresh local state, and a clean hook for transitions),
 * except the profiling and worlds screens: they stay across their fields /
 * questions and swap only what changes (TransitionElevator, TransitionDoor).
 */
const store = useSurveyStore()

const screenKey = computed(() => {
  const step = store.step
  if (step.kind === 'profiling') return 'profiling'
  if (step.kind === 'question') return 'worlds'
  return store.stepIndex
})

await useResponsePersistence()

// The central animation plays the loop of the current splash or world, and
// moves between them as the steps do. Its frames start loading right away:
// the intro and profiling give them time.
const stage = useStage()
watchEffect(() => {
  const step = store.step
  if (step.kind === 'splash') stage.setTarget(step.position === 'before' ? 0 : STAGE_LOOP_COUNT - 1)
  else if (step.kind === 'question') stage.setTarget(step.worldIndex + 1)
})
onMounted(stage.preload)

// Worlds and splash sit on white; everything else on black
const surfaceOf = (step: Step) =>
  step.kind === 'splash' || step.kind === 'question' ? 'surface-light' : 'surface-dark'

// Paint the page canvas (<html> and <body>) with the current surface too:
// mobile Safari tints its bars (and the overscroll area) from it, else they
// show white bands around the black screens. theme-color does the same for
// browsers that read it.
const isLight = computed(() => surfaceOf(store.step) === 'surface-light')
const canvasClass = () => isLight.value ? 'bg-paper' : 'bg-ink'
useHead({
  htmlAttrs: { class: canvasClass },
  bodyAttrs: { class: canvasClass },
  meta: [{ name: 'theme-color', content: () => isLight.value ? '#ffffff' : '#000000' }]
})

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

// A new world starts at the top: on mobile its screen is taller than the
// viewport, and whoever scrolled down to answer would miss the next world's
// title and animation coming in. The page glides up while the old world
// leaves (instantly with reduced motion).
const isNewWorld = (step: Step, prev: Step) =>
  step.kind === 'question' && prev.kind === 'question' && step.worldIndex !== prev.worldIndex

// Move focus into the new screen so keyboard and screen reader users land on
// it: its main field if it has one, else its heading. Skipped on first load.
// Content still on its way out is inert: skip it. On a new world, without
// scrolling to the field: that would undo the glide to the top.
const main = useTemplateRef<HTMLElement>('main')
const find = (selector: string) =>
  [...main.value?.querySelectorAll<HTMLElement>(selector) ?? []].find(el => !el.closest('[inert]'))
watch(() => store.step, async (step, prev) => {
  const newWorld = isNewWorld(step, prev)
  if (newWorld) {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
  }
  await nextTick()
  const target = find('[data-autofocus]') ?? find('h1')
  target?.focus({ preventScroll: newWorld })
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
