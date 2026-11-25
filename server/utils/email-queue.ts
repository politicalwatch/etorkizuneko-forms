import { getStore } from '@netlify/blobs'

/*
 * Emails left on the thanks screen wait here (a Netlify Blobs store) until the
 * daily flush writes them to Notion. Written as they arrive, Notion's creation
 * time of each email row would sit seconds away from the last save of the
 * person's response, matching the two. Flushed together and in random order,
 * every email gets about the same creation time.
 *
 * - One entry per email under a random key: concurrent signups never touch the
 *   same entry, and the keys say nothing about when or in which order emails
 *   were left (listing a store only returns keys).
 * - Each entry is deleted as soon as its Notion row is written; a failed write
 *   keeps it for the next flush.
 * - The store name comes from NUXT_EMAIL_QUEUE_STORE, set per Netlify deploy
 *   context so production and testing queues never mix. Local dev (nuxt dev)
 *   uses a local store, through @netlify/nuxt.
 * - Pinned to the EU (Frankfurt). The region must be passed on every call:
 *   without it Netlify uses the US one and sees an empty store.
 * - Strong consistency: the flush sees every entry, and deletions apply at
 *   once.
 */

const REGION = 'eu-central-1'

// Stop starting new writes after this long, to finish within the time limits
// of the scheduled function (30s) and the endpoint (60s). What's left waits
// for the next flush.
const FLUSH_BUDGET_MS = 20_000

function useEmailQueue() {
  const { store } = useRuntimeConfig().emailQueue
  if (!store) {
    throw createError({ statusCode: 503, statusMessage: 'The email queue is not configured' })
  }
  return getStore({ name: store, region: REGION, consistency: 'strong' })
}

/** Checks that emails can be queued: configured, and a Blobs environment available. */
export function ensureEmailQueue(): void {
  useEmailQueue()
}

/** Queues an email for the next flush, with the day it was left (consentDate). */
export async function queueEmail(signup: EmailSignup): Promise<void> {
  const entry: EmailRow = { ...signup, day: todayInSpain() }
  await useEmailQueue().setJSON(crypto.randomUUID(), entry)
}

/**
 * Writes the queued emails to Notion in random order, deleting each entry once
 * its row is written. Stops starting new writes once its time budget is spent
 * or on the first failure (Notion is down or misconfigured: the next flush
 * retries).
 */
export async function flushEmailQueue(): Promise<{ written: number, remaining: number }> {
  const queue = useEmailQueue()
  const { blobs } = await queue.list()
  const keys = shuffle(blobs.map(blob => blob.key))
  const deadline = Date.now() + FLUSH_BUDGET_MS

  let written = 0
  for (const key of keys) {
    if (Date.now() > deadline) break
    const entry = await queue.get(key, { type: 'json' }) as EmailRow | null
    if (entry) await createEmailRow(entry)
    await queue.delete(key)
    written++
  }
  return { written, remaining: keys.length - written }
}

// Fisher–Yates
function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j]!, items[i]!]
  }
  return items
}
