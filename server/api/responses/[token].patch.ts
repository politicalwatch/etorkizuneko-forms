/**
 * Updates a response's Notion row with the latest snapshot (the client sends
 * the whole response on every step, so the last write wins).
 */
export default defineEventHandler(async (event) => {
  const pageId = verifyResponseToken(getRouterParam(event, 'token') ?? '')
  if (!pageId) throw createError({ statusCode: 404, statusMessage: 'Unknown response' })

  const response = await readValidatedBody(event, parseSurveyResponse)
  await updateResponseRow(pageId, response)
  return null
})
