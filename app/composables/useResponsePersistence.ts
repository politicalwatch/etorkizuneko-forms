import { isSavedStep } from '#shared/survey/steps'

/**
 * Saves the response to Notion as the person goes, so unfinished responses
 * are kept too. Every step change sends the whole snapshot: the first one
 * creates the row (and gets back a token for it), later ones update it.
 *
 * Saves run one at a time, and changes made while one is in flight are sent
 * right after it, as a single save. A failed save is only logged: the next
 * step sends everything again.
 *
 * Whether saving works at all is checked on load (during SSR, so the intro
 * renders right away): if it doesn't, the survey can't be started. Await it
 * so the result is in before the intro renders.
 */
export async function useResponsePersistence() {
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
      email: store.email,
      emailConsentAt: store.emailConsentAt
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

  // Last: after an await the component context is lost
  const { error } = await useFetch('/api/responses/status')
  store.saveUnavailable = !!error.value
}
