import type { Config, Context } from '@netlify/functions'

/*
 * Daily flush of the email queue (server/utils/email-queue.ts). It only calls
 * the site's protected flush endpoint, so the Notion code stays in the Nuxt
 * server. Scheduled functions only run on the published production deploy;
 * elsewhere, call the endpoint by hand (see server/api/emails/flush.post.ts).
 */
export default async (_req: Request, context: Context) => {
  const secret = Netlify.env.get('NUXT_EMAIL_QUEUE_FLUSH_SECRET')
  if (!secret) {
    console.error('NUXT_EMAIL_QUEUE_FLUSH_SECRET is not set: emails are not flushed')
    return
  }

  const response = await fetch(new URL('/api/emails/flush', context.site.url), {
    method: 'POST',
    headers: { authorization: `Bearer ${secret}` }
  })
  if (!response.ok) {
    console.error(`Email flush failed: ${response.status} ${await response.text()}`)
    return
  }
  console.info('Email flush:', await response.json())
}

export const config: Config = {
  // 03:00 UTC (04:00 in Spain in winter, 05:00 in summer): away from busy hours
  schedule: '0 3 * * *'
}
