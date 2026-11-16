<script setup lang="ts">
/*
 * "Saber más" modal: what the survey is about, the partner logos and a link
 * to the project site. Texts are per instance; the profile list is built from
 * the instance's profile names so it always matches the result screen.
 */
import partnerLogos from '~/assets/images/partner-logos.png'

const open = defineModel<boolean>('open', { default: false })

// Same site for every instance and deployment. It routes with the same
// locale codes as this app (/es, /eu, /en), so link to the current one.
const PROJECT_URL = 'https://etorkizunekoforoa.eus'

const { t, locale } = useI18n()
const projectUrl = computed(() => `${PROJECT_URL}/${locale.value}`)
const { instance, textKey } = useInstance()

const profiles = computed(() =>
  instance.profiles.map(({ id }) => t(textKey(`profiles.${id}.name`)).toUpperCase()).join(', ')
)
</script>

<template>
  <AppModal
    v-model:open="open"
    :title="t(textKey('about.title'))"
    size="lg"
    closable
  >
    <!-- The PNG is the logos' alpha (white = opaque), used as a mask so they
         take the text color -->
    <span
      role="img"
      :aria-label="t('about.logos')"
      class="block aspect-2048/191 w-50 bg-ink mask-luminance mask-contain mask-no-repeat sm:w-72"
      :style="{ maskImage: `url(${partnerLogos})` }"
    />

    <div class="flex flex-col gap-3 leading-snug">
      <h2 class="mb-2 text-3xl leading-none font-semibold tracking-tight text-balance">
        {{ t(textKey('about.title')) }}
      </h2>

      <p>{{ t(textKey('about.p1')) }}</p>

      <i18n-t
        :keypath="textKey('about.p2')"
        tag="p"
        scope="global"
      >
        <template #focus>
          <strong>{{ t(textKey('about.focus')) }}</strong>
        </template>
        <template #profiles>
          <em>{{ profiles }}</em>
        </template>
      </i18n-t>

      <p>{{ t(textKey('about.p3')) }}</p>
      <p>{{ t(textKey('about.p4')) }}</p>
    </div>

    <template #footer>
      <UButton
        :to="projectUrl"
        target="_blank"
        size="xl"
        block
        :label="t('about.cta')"
      />
    </template>
  </AppModal>
</template>
