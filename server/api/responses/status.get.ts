/**
 * Whether responses can be saved right now: 204 if both Notion tables
 * (responses and emails) are configured and writable and the email queue is
 * configured, 503 otherwise. The survey doesn't let anyone start without it
 * (useResponsePersistence), unless NUXT_NOTION_OPTIONAL=true.
 */
export default defineEventHandler(async (event) => {
  try {
    ensureEmailQueue()
    await Promise.all([ensureNotionTable('responses'), ensureNotionTable('emails')])
  } catch (error) {
    // The reason is for the server log only (config or Notion details)
    console.error('Responses cannot be saved:', error)
    // Testing without a table: the survey runs, nothing is recorded
    if (!useRuntimeConfig(event).notion.optional) {
      throw createError({ statusCode: 503, statusMessage: 'Responses cannot be saved' })
    }
  }
  setResponseStatus(event, 204)
  return null
})
