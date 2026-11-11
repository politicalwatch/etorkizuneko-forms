import type { InstanceDefinition } from '../survey/instance'
import industria from './industria'

/*
 * Every thematic instance of the form. The deployment picks one with
 * NUXT_PUBLIC_INSTANCE_NAME.
 *
 * To add one: create its definition file here, register it below and add its
 * texts under i18n/locales/instances/<name>/ (nuxt.config picks them up).
 *
 * Relative imports only: nuxt.config imports this file to validate the env.
 */
export const instances = {
  industria
} satisfies Record<string, InstanceDefinition>

export type InstanceName = keyof typeof instances

export const instanceNames = Object.keys(instances) as InstanceName[]

export function isInstanceName(name: string): name is InstanceName {
  return name in instances
}
