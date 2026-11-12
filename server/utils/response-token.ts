import { createHmac, timingSafeEqual } from 'node:crypto'

/*
 * The client keeps a reference to its Notion row so later steps update the
 * same row. Notion page ids are partly sequential (guessable), so the client
 * gets the id signed by the server instead: `<page id>.<HMAC>`. Only a token
 * issued by POST /api/responses can update a row, and only that one.
 *
 * The HMAC key is derived from the Notion API key, the one secret this server
 * already holds; rotating that key invalidates the tokens of in-progress
 * responses (they simply start a new row).
 */

function sign(pageId: string): string {
  const key = createHmac('sha256', 'etorkizuneko-forms:response-token')
    .update(useRuntimeConfig().notion.apiKey)
    .digest()
  return createHmac('sha256', key).update(pageId).digest('base64url')
}

export function issueResponseToken(pageId: string): string {
  return `${pageId}.${sign(pageId)}`
}

/** Page id the token refers to, or null if it wasn't issued by this server. */
export function verifyResponseToken(token: string): string | null {
  const [pageId, signature, ...rest] = token.split('.')
  if (!pageId || !signature || rest.length) return null

  const expected = Buffer.from(sign(pageId))
  const actual = Buffer.from(signature)
  return actual.length === expected.length && timingSafeEqual(actual, expected) ? pageId : null
}
