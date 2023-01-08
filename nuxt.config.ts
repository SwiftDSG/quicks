// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      base: process.env.BASE_URL || 'http://localhost:3000',
      apiBase: process.env.API_URL || 'http://localhost:8000',
      fontApi: process.env.GOOGLE_FONT_API
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'id'
      },
      titleTemplate: '%s — Simpul\'s innovative communication platform.',
      title: 'Quicks',
      meta: [
        { charset: 'utf-8' },
        { name: 'keywords', content: 'Quicks, Simpul\'s innovative communication platform.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'googlebot', content: 'notranslate' },
        { name: 'msapplication-TileColor', content: '#ffa84c' },
        { name: 'theme-color', content: '#ffffff' },
        { hid: 'description', name: 'description', content: 'Quicks' },
      ],
    },
  },
  css: [
    '~/assets/fonts.scss',
  ],
  build: {
    loaders: {
      scss: {
        implementation: require('sass')
      }
    },
  },
})
