import { isSavedStep } from '#shared/survey/steps'

/**
 * Saves the response to Notion as the person goes, so unfinished responses
 * are kept too. Every step change sends the whole snapshot: the first one
 * creates the row (and gets back a token for it), later ones update it.
 *
 * Saves run one at a time, and changes made while one is in flight are sent
 * right after it, as a single save. A failed save is only logged: the next
 * step sends everything again.
 */
export function useResponsePersistence() {
  const store = useSurveyStore()
  const { locale } = useI18n()

  let saving = false
  let pending = false

  async function send() {
    const body = {
      locale: locale.value,
      step: store.stepId,
      profiling: store.profiling,
      answers: store.answers,
      email: store.email
    }
    // keepalive: the last save still goes through if the tab is closed
    if (store.responseToken) {
      await $fetch(`/api/responses/${store.responseToken}`, { method: 'PATCH', body, keepalive: true })
    } else {
      const { token } = await $fetch('/api/responses', { method: 'POST', body, keepalive: true })
      store.responseToken = token
    }
  }

  async function save() {
    if (saving) {
      pending = true
      return
    }
    saving = true
    try {
      do {
        pending = false
        try {
          await send()
        } catch (error) {
          console.error('Could not save the response', error)
        }
      } while (pending)
    } finally {
      saving = false
    }
  }

  watch(() => store.stepIndex, () => {
    if (isSavedStep(store.step)) save()
  })
}
