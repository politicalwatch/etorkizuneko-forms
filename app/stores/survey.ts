import { defineStore } from 'pinia'
import type { InstanceDefinition } from '~/survey/instance'
import type { ProfilingFieldId, ProfilingValue } from '~/survey/profiling'
import { resolveProfile, type Answers } from '~/survey/scoring'

export type ProfilingAnswers = Partial<Record<ProfilingFieldId, ProfilingValue>>

/*
 * The whole experience is one guided flow. Each step is one screen; the page
 * renders the screen for the current step. Keeping it a flat list makes
 * "next", progress and (later) GSAP transitions between screens trivial.
 */
export type Step
  = | { kind: 'intro' }
    | { kind: 'profiling', fieldIndex: number }
    // Interstitial shown when entering and leaving the worlds
    | { kind: 'splash', position: 'before' | 'after' }
    | { kind: 'question', worldIndex: number, questionIndex: number, flatIndex: number }
    | { kind: 'result' }
    | { kind: 'thanks' }
    | { kind: 'outro' }

export function buildSteps(instance: InstanceDefinition): Step[] {
  const steps: Step[] = [{ kind: 'intro' }]

  instance.profiling.forEach((_, fieldIndex) => steps.push({ kind: 'profiling', fieldIndex }))

  steps.push({ kind: 'splash', position: 'before' })

  let flatIndex = 0
  instance.worlds.forEach((world, worldIndex) => {
    world.questions.forEach((_, questionIndex) => {
      steps.push({ kind: 'question', worldIndex, questionIndex, flatIndex: flatIndex++ })
    })
  })

  steps.push(
    { kind: 'splash', position: 'after' },
    { kind: 'result' },
    { kind: 'thanks' },
    { kind: 'outro' }
  )

  return steps
}

function emptyProfiling(instance: InstanceDefinition): ProfilingAnswers {
  return Object.fromEntries(instance.profiling.map(field => [
    field.id,
    field.kind === 'select' && field.multiple ? [] : null
  ]))
}

export const useSurveyStore = defineStore('survey', () => {
  const { instance } = useInstance()

  const steps = buildSteps(instance)
  const questionCount = instance.worlds.reduce((total, world) => total + world.questions.length, 0)

  const profiling = ref<ProfilingAnswers>(emptyProfiling(instance))
  const answers = ref<Answers>({})
  const email = ref('')

  const stepIndex = ref(0)
  const step = computed(() => steps[stepIndex.value]!)

  // Id of the winning result profile
  const result = computed(() => resolveProfile(instance.profiles, answers.value))

  /**
   * Progress (0–1) shown on the side ruler, or null when the screen shows
   * none. Each section (profiling / worlds) runs 0 → 100% on its own.
   */
  const progress = computed<number | null>(() => {
    const current = step.value
    switch (current.kind) {
      case 'profiling':
        return current.fieldIndex / (instance.profiling.length - 1)
      case 'splash':
        return current.position === 'before' ? 0 : 1
      case 'question':
        return current.flatIndex / (questionCount - 1)
      default:
        return null
    }
  })

  function next() {
    if (stepIndex.value < steps.length - 1) stepIndex.value++
  }

  function reset() {
    profiling.value = emptyProfiling(instance)
    answers.value = {}
    email.value = ''
    stepIndex.value = 0
  }

  return { profiling, answers, email, stepIndex, step, result, progress, next, reset }
})
