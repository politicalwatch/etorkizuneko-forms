// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/storybook',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2026-06-30',

  i18n: {
    // No URL prefix: the form is a guided flow, and switching language
    // (setLocale) must not navigate or lose what has already been filled in.
    strategy: 'no_prefix',
    defaultLocale: 'es',
    locales: [
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'eu', language: 'eu-ES', name: 'Euskera', file: 'eu.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' }
    ],
    // The chosen language is stored in a cookie so it survives reloads
    // (and SSR renders in that language). On the first visit the browser
    // language is used if supported; otherwise, es.
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'es'
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
