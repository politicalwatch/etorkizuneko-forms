/**
 * Queues an email left on the thanks screen; the daily flush writes it to its
 * own Notion table (server/utils/email-queue.ts). It takes no response token
 * and writes nothing to the response, so the email can't be matched to the
 * answers.
 */
export default defineEventHandler(async (event) => {
  const signup = await readValidatedBody(event, parseEmailSignup)
  await queueEmail(signup)
  setResponseStatus(event, 204)
  return null
})
