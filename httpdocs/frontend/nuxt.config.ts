import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  runtimeConfig: {
    public: {
      apiBase: 'http://dev.api.dev-nuxt.com.ua',
      oauthClientId: '01a07213-f635-7180-89ad-2f9fa42159d6',
      oauthRedirectUri: 'http://dev.dev-nuxt.com.ua/auth/callback',
    },
  },
  vite: {
    server: {
      allowedHosts: ['dev.dev-nuxt.com.ua'],
    },
    plugins: [
      tailwindcss(),
    ],
  }
})
