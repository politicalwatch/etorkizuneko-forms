import type { ResultProfile } from './instance'
import { SCALE_MAX, SCALE_MIN } from './scale'

/*
 * Result profile scoring, generic over the instance's profiles: each profile
 * adds up its linked answers (inverted ones count as min + max − answer) and
 * the highest score wins.
 */

export type Answers = Partial<Record<string, number>>

export function scoreProfiles(profiles: readonly ResultProfile[], answers: Answers): Record<string, number> {
  return Object.fromEntries(profiles.map(profile => [
    profile.id,
    profile.questions.reduce((total, { id, inverted }) => {
      const answer = answers[id]
      if (answer == null) return total
      return total + (inverted ? SCALE_MIN + SCALE_MAX - answer : answer)
    }, 0)
  ]))
}

/**
 * Id of the winning profile. On a tie the first one in `profiles` order wins
 * (the tie-break rule is still to be defined).
 */
export function resolveProfile(profiles: readonly ResultProfile[], answers: Answers): string {
  const scores = scoreProfiles(profiles, answers)
  return profiles.reduce((best, profile) => (scores[profile.id]! > scores[best.id]! ? profile : best)).id
}
