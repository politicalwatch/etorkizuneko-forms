// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/storybook',
    '@nuxtjs/i18n',
    '@pinia/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // The design has a fixed identity (black / white / magenta) and screens pick
  // their own surface, so there's no dark mode. Disabling it also drops
  // @nuxtjs/color-mode, whose client plugin crashes in Storybook (it expects
  // a helper script injected into the SSR HTML).
  ui: {
    colorMode: false
  },

  runtimeConfig: {
    public: {
      // Target of the header "Saber más" button (NUXT_PUBLIC_LEARN_MORE_URL)
      learnMoreUrl: ''
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

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
  }
})
