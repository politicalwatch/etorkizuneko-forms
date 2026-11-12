import { instanceNames, instances, isInstanceName } from '#shared/instances'

/**
 * The thematic instance this deployment serves, and the i18n key of its own
 * texts: `t(textKey('intro.subtitle'))` → `instances.<name>.intro.subtitle`.
 * Shared UI texts keep their plain keys.
 */
export function useInstance() {
  const name = useRuntimeConfig().public.instanceName

  // nuxt.config validates NUXT_PUBLIC_INSTANCE_NAME at startup; this also
  // covers a value set only at runtime (e.g. on the production server)
  if (!isInstanceName(name)) {
    throw createError({
      statusCode: 500,
      statusMessage: `Unknown instance "${name}". Available: ${instanceNames.join(', ')}`,
      fatal: true
    })
  }

  return {
    instance: instances[name],
    textKey: (path: string) => `instances.${name}.${path}`
  }
}
