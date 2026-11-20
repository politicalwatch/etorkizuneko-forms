import { z } from 'zod'
import { instances, isInstanceName } from '#shared/instances'
import type { InstanceDefinition } from '#shared/survey/instance'
import type { ProfilingField } from '#shared/survey/profiling'
import { SCALE_MAX, SCALE_MIN } from '#shared/survey/scale'
import { buildSteps, stepKey } from '#shared/survey/steps'

/** The instance this deployment serves (NUXT_PUBLIC_INSTANCE_NAME). */
export function useSurveyInstance(): InstanceDefinition {
  const name = useRuntimeConfig().public.instanceName
  if (!isInstanceName(name)) {
    throw createError({ statusCode: 500, statusMessage: `Unknown instance "${name}"` })
  }
  return instances[name]
}

function profilingValueSchema(field: ProfilingField) {
  switch (field.kind) {
    case 'number':
      return z.number().int().min(field.min).max(field.max).nullable()
    case 'postalCode':
      return z.string().regex(/^\d{5}$/).nullable()
    case 'select': {
      const option = z.enum(field.options as [string, ...string[]])
      return field.multiple ? z.array(option).max(field.options.length) : option.nullable()
    }
  }
}

/*
 * Snapshot of a (possibly unfinished) response, as the client sends it on
 * every step. Never holds contact details: emails go to their own table
 * (parseEmailSignup). Built from the instance definition, so only its own fields,
 * questions and steps are accepted; anything unknown is rejected.
 */
function buildResponseSchema(instance: InstanceDefinition) {
  const questionIds = instance.worlds.flatMap(world => world.questions)
  const stepIds = buildSteps(instance).map(step => stepKey(instance, step))

  return z.strictObject({
    locale: z.enum(['es', 'eu', 'en']),
    // How far the person got: the step they are on now
    step: z.enum(stepIds as [string, ...string[]]),
    profiling: z.strictObject(Object.fromEntries(
      instance.profiling.map(field => [field.id, profilingValueSchema(field).optional()])
    )),
    answers: z.strictObject(Object.fromEntries(
      questionIds.map(id => [id, z.number().min(SCALE_MIN).max(SCALE_MAX).optional()])
    ))
  })
}

export type SurveyResponse = z.infer<ReturnType<typeof buildResponseSchema>>

let schema: ReturnType<typeof buildResponseSchema> | undefined

/** Validator for readValidatedBody. */
export function parseSurveyResponse(body: unknown): SurveyResponse {
  schema ??= buildResponseSchema(useSurveyInstance())
  return schema.parse(body)
}

// Accepted privacy policy: the client only sends it once the box is ticked
const emailSignupSchema = z.strictObject({
  email: z.email().max(254),
  consent: z.literal(true)
})

/** Validator for readValidatedBody: an email left on the thanks screen. */
export function parseEmailSignup(body: unknown): EmailSignup {
  return emailSignupSchema.parse(body)
}
