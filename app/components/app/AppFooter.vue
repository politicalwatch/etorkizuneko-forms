<script setup lang="ts">
/*
 * Bottom of the survey page: the tagline and a link to the privacy policy,
 * reachable from every screen. `compact` drops the tagline on mobile (the
 * full-bleed white screens); the link always stays.
 */
defineProps<{ compact?: boolean }>()

const { t } = useI18n()
</script>

<template>
  <!--
    Below md the link sits under the tagline. From md on, three columns keep
    the tagline centered and put the link at the right edge, vertically
    centered with it
  -->
  <footer class="flex flex-col items-center gap-2 px-6 pb-4 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6 md:pb-8">
    <AppTagline
      class="md:col-start-2"
      :class="{ 'max-md:hidden': compact }"
    />

    <!-- New tab: leaving the page would lose the response. The policy is only in Spanish -->
    <ULink
      :to="PRIVACY_POLICY_PATH"
      target="_blank"
      hreflang="es"
      class="text-xs text-(--surface-muted) underline underline-offset-4 hover:text-(--surface-fg) md:justify-self-end"
    >
      {{ t('app.privacyPolicy') }}<span class="sr-only"> {{ t('app.newTab') }}</span>
    </ULink>
  </footer>
</template>
