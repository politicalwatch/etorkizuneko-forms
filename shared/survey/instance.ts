import type { ProfilingField } from './profiling'

/*
 * A thematic instance of the form (Industria, …): its worlds, its result
 * profiles and which profiling questions it asks. The deployment picks one
 * with NUXT_PUBLIC_INSTANCE_NAME (see shared/instances).
 *
 * Structure only: texts live in i18n under `instances.<name>.*` (see
 * useInstance), keyed by these ids, which are also the stable keys we
 * persist — don't rename them lightly.
 */

export interface World {
  id: string
  questions: readonly string[]
}

export interface ScoredQuestion {
  id: string
  // Disagreeing adds to the profile: score = (min + max) − answer
  inverted?: boolean
}

export interface ResultProfile {
  id: string
  questions: readonly ScoredQuestion[]
  // Name of its share card images: public/share/Card_profile_<card>_<locale>.jpg
  card: string
}

export interface InstanceDefinition {
  name: string
  profiling: readonly ProfilingField[]
  worlds: readonly World[]
  // Order matters: on a tie, the first one wins
  profiles: readonly ResultProfile[]
}

/**
 * Typed helper for instance files: a profile can only reference question ids
 * that exist in the instance's worlds, so a typo is a type error.
 */
export function defineInstance<const W extends readonly World[]>(instance: {
  name: string
  profiling: readonly ProfilingField[]
  worlds: W
  profiles: readonly {
    id: string
    questions: readonly { id: W[number]['questions'][number], inverted?: boolean }[]
    card: string
  }[]
}): InstanceDefinition {
  return instance
}
