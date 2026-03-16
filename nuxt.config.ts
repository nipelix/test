import { fileURLToPath } from 'node:url'

// All world languages — active/inactive controlled by DB, not config.
// dynamic.ts loader checks DB, returns TR fallback if inactive.
const ALL_LOCALES = [
  { code: 'af', language: 'af', file: 'dynamic.ts', name: 'Afrikaans' },
  { code: 'am', language: 'am', file: 'dynamic.ts', name: 'Amharic' },
  { code: 'ar', language: 'ar', file: 'dynamic.ts', name: 'Arabic', dir: 'rtl' },
  { code: 'az', language: 'az', file: 'dynamic.ts', name: 'Azerbaijani' },
  { code: 'be', language: 'be', file: 'dynamic.ts', name: 'Belarusian' },
  { code: 'bg', language: 'bg', file: 'dynamic.ts', name: 'Bulgarian' },
  { code: 'bn', language: 'bn', file: 'dynamic.ts', name: 'Bengali' },
  { code: 'bs', language: 'bs', file: 'dynamic.ts', name: 'Bosnian' },
  { code: 'ca', language: 'ca', file: 'dynamic.ts', name: 'Catalan' },
  { code: 'cs', language: 'cs', file: 'dynamic.ts', name: 'Czech' },
  { code: 'da', language: 'da', file: 'dynamic.ts', name: 'Danish' },
  { code: 'de', language: 'de', file: 'dynamic.ts', name: 'German' },
  { code: 'el', language: 'el', file: 'dynamic.ts', name: 'Greek' },
  { code: 'en', language: 'en-US', file: 'dynamic.ts', name: 'English' },
  { code: 'es', language: 'es', file: 'dynamic.ts', name: 'Spanish' },
  { code: 'et', language: 'et', file: 'dynamic.ts', name: 'Estonian' },
  { code: 'fa', language: 'fa', file: 'dynamic.ts', name: 'Persian', dir: 'rtl' },
  { code: 'fi', language: 'fi', file: 'dynamic.ts', name: 'Finnish' },
  { code: 'fr', language: 'fr', file: 'dynamic.ts', name: 'French' },
  { code: 'he', language: 'he', file: 'dynamic.ts', name: 'Hebrew', dir: 'rtl' },
  { code: 'hi', language: 'hi', file: 'dynamic.ts', name: 'Hindi' },
  { code: 'hr', language: 'hr', file: 'dynamic.ts', name: 'Croatian' },
  { code: 'hu', language: 'hu', file: 'dynamic.ts', name: 'Hungarian' },
  { code: 'id', language: 'id', file: 'dynamic.ts', name: 'Indonesian' },
  { code: 'it', language: 'it', file: 'dynamic.ts', name: 'Italian' },
  { code: 'ja', language: 'ja', file: 'dynamic.ts', name: 'Japanese' },
  { code: 'ka', language: 'ka', file: 'dynamic.ts', name: 'Georgian' },
  { code: 'kk', language: 'kk', file: 'dynamic.ts', name: 'Kazakh' },
  { code: 'ko', language: 'ko', file: 'dynamic.ts', name: 'Korean' },
  { code: 'ku', language: 'ku', file: 'dynamic.ts', name: 'Kurdish' },
  { code: 'lt', language: 'lt', file: 'dynamic.ts', name: 'Lithuanian' },
  { code: 'lv', language: 'lv', file: 'dynamic.ts', name: 'Latvian' },
  { code: 'mk', language: 'mk', file: 'dynamic.ts', name: 'Macedonian' },
  { code: 'mn', language: 'mn', file: 'dynamic.ts', name: 'Mongolian' },
  { code: 'ms', language: 'ms', file: 'dynamic.ts', name: 'Malay' },
  { code: 'nb', language: 'nb', file: 'dynamic.ts', name: 'Norwegian' },
  { code: 'nl', language: 'nl', file: 'dynamic.ts', name: 'Dutch' },
  { code: 'pl', language: 'pl', file: 'dynamic.ts', name: 'Polish' },
  { code: 'pt', language: 'pt', file: 'dynamic.ts', name: 'Portuguese' },
  { code: 'ro', language: 'ro', file: 'dynamic.ts', name: 'Romanian' },
  { code: 'ru', language: 'ru', file: 'dynamic.ts', name: 'Russian' },
  { code: 'sk', language: 'sk', file: 'dynamic.ts', name: 'Slovak' },
  { code: 'sl', language: 'sl', file: 'dynamic.ts', name: 'Slovenian' },
  { code: 'sq', language: 'sq', file: 'dynamic.ts', name: 'Albanian' },
  { code: 'sr', language: 'sr', file: 'dynamic.ts', name: 'Serbian' },
  { code: 'sv', language: 'sv', file: 'dynamic.ts', name: 'Swedish' },
  { code: 'sw', language: 'sw', file: 'dynamic.ts', name: 'Swahili' },
  { code: 'th', language: 'th', file: 'dynamic.ts', name: 'Thai' },
  { code: 'tr', language: 'tr-TR', file: 'dynamic.ts', name: 'Türkçe' },
  { code: 'uk', language: 'uk', file: 'dynamic.ts', name: 'Ukrainian' },
  { code: 'ur', language: 'ur', file: 'dynamic.ts', name: 'Urdu', dir: 'rtl' },
  { code: 'uz', language: 'uz', file: 'dynamic.ts', name: 'Uzbek' },
  { code: 'vi', language: 'vi', file: 'dynamic.ts', name: 'Vietnamese' },
  { code: 'zh', language: 'zh', file: 'dynamic.ts', name: 'Chinese' }
]

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxt/icon',
    '@pinia/nuxt',
    'nuxt-auth-utils'
  ],

  devServer: {
    host: '0.0.0.0',
    port: 3010
  },

  devtools: {
    enabled: true
  },

  typescript: {
    strict: true
  },

  css: ['~/assets/css/main.css'],

  i18n: {
    locales: ALL_LOCALES,
    defaultLocale: 'tr',
    fallbackLocale: 'tr',
    lazy: true,
    langDir: '../i18n/locales',
    strategy: 'prefix_except_default'
  },

  routeRules: {
    '/': { redirect: '/sportsbook' },
    '/panel/**': { ssr: false }
  },

  alias: {
    '@mock': fileURLToPath(new URL('./mock', import.meta.url))
  },

  runtimeConfig: {
    databaseUrl: '',
    redisUrl: '',
    sessionSecret: '',
    webauthnRpId: 'localhost',
    webauthnRpName: 'Sinek2',
    webauthnOrigin: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3010'
  },

  nitro: {
    experimental: {
      websocket: true
    }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
