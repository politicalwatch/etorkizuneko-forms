import { defineStore } from 'pinia'
import type { InstanceDefinition } from '~/survey/instance'
import type { ProfilingFieldId, ProfilingValue } from '~/survey/profiling'
import { resolveProfile, type Answers } from '~/survey/scoring'
import { buildSteps, stepKey } from '~/survey/steps'

export type ProfilingAnswers = Partial<Record<ProfilingFieldId, ProfilingValue>>

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
  const stepId = computed(() => stepKey(instance, step.value))

  // Signed reference to this response's Notion row, set by the first save
  // (useResponsePersistence). Lives only in memory: a reload starts a new one.
  const responseToken = ref<string | null>(null)

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

  // Past the last question: the ruler shows fully lit, without a percentage
  const finished = computed(() => ['result', 'thanks', 'outro'].includes(step.value.kind))

  function next() {
    if (stepIndex.value < steps.length - 1) stepIndex.value++
  }

  function reset() {
    profiling.value = emptyProfiling(instance)
    answers.value = {}
    email.value = ''
    stepIndex.value = 0
    responseToken.value = null
  }

  return { profiling, answers, email, stepIndex, step, stepId, responseToken, result, progress, finished, next, reset }
})
