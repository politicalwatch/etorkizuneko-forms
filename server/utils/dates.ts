// Today in Spain, as YYYY-MM-DD. Saved dates are kept to the day, so they
// can't be used to match an email to a response.
const spanishDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' })

export const todayInSpain = () => spanishDay.format(new Date())
