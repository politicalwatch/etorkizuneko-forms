/**
 * Saves an email left on the thanks screen to its own Notion table. It takes
 * no response token and writes nothing to the response, so the email can't
 * be matched to the answers.
 */
export default defineEventHandler(async (event) => {
  const signup = await readValidatedBody(event, parseEmailSignup)
  await createEmailRow(signup)
  setResponseStatus(event, 204)
  return null
})
