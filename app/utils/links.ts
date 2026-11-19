/*
 * Links to the project site. It is the same for every instance and
 * deployment, and routes with the same locale codes as this app (/es, /eu,
 * /en), so links point to the current locale.
 */
const PROJECT_SITE = 'https://etorkizunekoforoa.eus'

export const projectUrl = (locale: string) => `${PROJECT_SITE}/${locale}`

// Placeholder until the privacy policy is published: update once its URL is known
export const privacyPolicyUrl = (locale: string) => `${PROJECT_SITE}/${locale}/privacy`
