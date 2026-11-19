/**
 * Whether responses can be saved right now: 204 if the Notion table is
 * configured and writable, 503 otherwise. The survey doesn't let anyone start
 * without it (useResponsePersistence), unless NUXT_NOTION_OPTIONAL=true.
 */
export default defineEventHandler(async (event) => {
  try {
    await ensureNotionTable()
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
