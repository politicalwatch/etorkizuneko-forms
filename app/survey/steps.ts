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

/**
 * Stable, readable id of a step (`profiling.age`, `question.fun`, `result`…).
 * Persisted as how far a response got, so keep it in sync with the ids.
 */
export function stepKey(instance: InstanceDefinition, step: Step): string {
  switch (step.kind) {
    case 'profiling':
      return `profiling.${instance.profiling[step.fieldIndex]!.id}`
    case 'splash':
      return `splash.${step.position}`
    case 'question':
      return `question.${instance.worlds[step.worldIndex]!.questions[step.questionIndex]!}`
    default:
      return step.kind
  }
}
