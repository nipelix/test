import { fileURLToPath } from 'node:url'

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
    port: 3010,
  },
  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
      { code: 'tr', language: 'tr-TR', file: 'tr.json', name: 'Türkçe' }
    ],
    defaultLocale: 'tr',
    lazy: true,
    langDir: '../i18n/locales',
    strategy: 'prefix_except_default'
  },

  routeRules: {
    '/': { redirect: '/sportsbook' }
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
    webauthnOrigin: 'http://localhost:3000'
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
