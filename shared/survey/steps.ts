import type { InstanceDefinition } from './instance'

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

/** Key of a profiling field: its step and its Notion column (`profiling.age`). */
export const profilingKey = (fieldId: string) => `profiling.${fieldId}`

/**
 * Key of a question, with its 1-based world and question position
 * (`question.w1q3_goodSalary`): its step and its Notion column. Moving a
 * question therefore changes its key.
 */
export const questionKey = (worldIndex: number, questionIndex: number, questionId: string) =>
  `question.w${worldIndex + 1}q${questionIndex + 1}_${questionId}`

/**
 * Stable, readable id of a step (`profiling.age`, `question.w1q1_fun`,
 * `splash.before`, `result`…). Persisted as how far a response got; profiling
 * and question steps match their Notion column, so the column where a
 * response stopped can be found by name.
 */
export function stepKey(instance: InstanceDefinition, step: Step): string {
  switch (step.kind) {
    case 'profiling':
      return profilingKey(instance.profiling[step.fieldIndex]!.id)
    case 'splash':
      return `splash.${step.position}`
    case 'question':
      return questionKey(step.worldIndex, step.questionIndex, instance.worlds[step.worldIndex]!.questions[step.questionIndex]!)
    default:
      return step.kind
  }
}

/**
 * Whether a response is saved on reaching this step: nothing is saved until
 * the first profiling answer, i.e. before leaving the first profiling step.
 */
export function isSavedStep(step: Step): boolean {
  return step.kind !== 'intro' && !(step.kind === 'profiling' && step.fieldIndex === 0)
}
