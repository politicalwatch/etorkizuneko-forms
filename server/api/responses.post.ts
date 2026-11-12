/**
 * Starts a response: creates its Notion row from the first snapshot and
 * returns the token the client uses to update it (PATCH /api/responses/:token).
 */
export default defineEventHandler(async (event) => {
  const response = await readValidatedBody(event, parseSurveyResponse)
  const pageId = await createResponseRow(response)
  return { token: issueResponseToken(pageId) }
})
