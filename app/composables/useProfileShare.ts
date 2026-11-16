import type { MaybeRefOrGetter } from 'vue'

/**
 * Links to share a result profile: its share page (/profile/<id>?lang=<code>,
 * whose preview image is the profile's card) and the card image itself.
 * Absolute, since they leave the site (clipboard, WhatsApp, og:image).
 */
export function useProfileShare(profileId: MaybeRefOrGetter<string>, locale: MaybeRefOrGetter<string>) {
  const { instance } = useInstance()
  const { origin } = useRequestURL()

  const profile = computed(() => instance.profiles.find(({ id }) => id === toValue(profileId)))

  const pageUrl = computed(() =>
    `${origin}/profile/${encodeURIComponent(toValue(profileId))}?lang=${toValue(locale)}`
  )
  const cardUrl = computed(() =>
    profile.value ? `${origin}/share/Card_profile_${profile.value.card}_${toValue(locale)}.jpg` : undefined
  )

  return { profile, pageUrl, cardUrl }
}
