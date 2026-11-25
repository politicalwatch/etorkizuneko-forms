import { timingSafeEqual } from 'node:crypto'

/**
 * Writes the queued emails to Notion (flushEmailQueue). Called daily by the
 * Netlify scheduled function (netlify/functions/flush-emails.mts), or by hand
 * to test it outside production:
 *
 *   curl -X POST -H "Authorization: Bearer $NUXT_EMAIL_QUEUE_FLUSH_SECRET" <site>/api/emails/flush
 *
 * Needs the secret (NUXT_EMAIL_QUEUE_FLUSH_SECRET); without one configured,
 * the endpoint is disabled.
 */
export default defineEventHandler(async (event) => {
  const { flushSecret } = useRuntimeConfig(event).emailQueue
  const given = getHeader(event, 'authorization')?.replace(/^Bearer /, '') ?? ''
  if (!flushSecret || !sameSecret(given, flushSecret)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const result = await flushEmailQueue()
  console.info('Email queue flushed:', result)
  return result
})

function sameSecret(given: string, expected: string) {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
