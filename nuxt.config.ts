// https://nuxt.com/docs/api/configuration/nuxt-config
import { existsSync } from 'node:fs'
import { instanceNames, isInstanceName } from './shared/instances'

// Thematic instance this deployment serves (shared/instances). Nuxt maps
// NUXT_PUBLIC_INSTANCE_NAME onto runtimeConfig.public.instanceName at runtime;
// reading it here too (.env is already loaded) makes a typo fail at startup
// instead of on the first render.
const INSTANCE_NAME = process.env.NUXT_PUBLIC_INSTANCE_NAME ?? 'industria'

if (!isInstanceName(INSTANCE_NAME)) {
  throw new Error(
    `Unknown NUXT_PUBLIC_INSTANCE_NAME "${INSTANCE_NAME}". Available: ${instanceNames.join(', ')}.\n`
    + 'Set it in .env (see .env.example).'
  )
}

/**
 * i18n files for a language: the shared UI texts plus each registered
 * instance's own texts (`instances/<name>/<code>.json` → `instances.<name>.*`).
 * @nuxtjs/i18n doesn't expand globs, and listing them from the registry means
 * only registered instances are bundled. All of them are, so the runtime
 * override keeps working. `required` (the source language) fails at startup
 * if an instance is missing its file; other languages are optional, missing
 * keys fall back to es. A new file needs a dev server restart.
 */
function localeFiles(code: string, { required = false } = {}) {
  const files = [`${code}.json`]
  for (const name of instanceNames) {
    const file = `instances/${name}/${code}.json`
    if (existsSync(new URL(`./i18n/locales/${file}`, import.meta.url))) files.push(file)
    else if (required) throw new Error(`Missing i18n/locales/${file} (texts of instance "${name}")`)
  }
  return files
}

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
    // Where responses are saved (server/utils/notion.ts): the integration's
    // token (NUXT_NOTION_API_KEY) and the table's data source id
    // (NUXT_NOTION_DATA_SOURCE_ID), set per deployment
    notion: {
      apiKey: '',
      dataSourceId: ''
    },
    public: {
      instanceName: INSTANCE_NAME
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

  // DM Sans comes from Nuxt UI's defaults (400–700); the design also uses
  // Light for typed numbers (FormNumberField)
  fonts: {
    defaults: {
      weights: [300, 400, 500, 600, 700]
    }
  },

  i18n: {
    // No URL prefix: the form is a guided flow, and switching language
    // (setLocale) must not navigate or lose what has already been filled in.
    strategy: 'no_prefix',
    defaultLocale: 'es',
    locales: [
      { code: 'es', language: 'es-ES', name: 'Español', files: localeFiles('es', { required: true }) },
      { code: 'eu', language: 'eu-ES', name: 'Euskera', files: localeFiles('eu') },
      { code: 'en', language: 'en-US', name: 'English', files: localeFiles('en') }
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
