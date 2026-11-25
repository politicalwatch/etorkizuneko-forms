/*
 * Links to the project site. It is the same for every instance and
 * deployment, and routes with the same locale codes as this app (/es, /eu,
 * /en), so links point to the current locale.
 */
const PROJECT_SITE = 'https://etorkizunekoforoa.eus'

export const projectUrl = (locale: string) => `${PROJECT_SITE}/${locale}`

// Privacy policy page (pages/politica-privacidad.vue): one for every instance,
// in Spanish only for now. Opened in a new tab from the survey, since leaving
// the page would lose the response.
export const PRIVACY_POLICY_PATH = '/politica-privacidad'

// Where people exercise their data protection rights (the controller, see the
// privacy policy)
export const DATA_RIGHTS_EMAIL = 'hello@feeldot.com'
