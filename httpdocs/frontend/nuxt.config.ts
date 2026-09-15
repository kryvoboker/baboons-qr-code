import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
    compatibilityDate: '2026-08-10',
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
    vite: {
        plugins: [tailwindcss()],
    },
    runtimeConfig: {
        backendInternalBase: process.env.NUXT_BACKEND_INTERNAL_BASE || 'http://qr-code-nginx',
        qrRendererInternalBase: process.env.NUXT_QR_RENDERER_INTERNAL_BASE || 'http://qr-renderer:3100',
        qrRendererSharedSecret: process.env.NUXT_QR_RENDERER_SHARED_SECRET || '',
        authCookieSecure: process.env.NUXT_AUTH_COOKIE_SECURE === 'true',
        bffSharedSecret: process.env.NUXT_BFF_SHARED_SECRET || '',
        public: {
            appName: process.env.NUXT_PUBLIC_APP_NAME || 'Baboons QR-code',
            backendBase: process.env.NUXT_PUBLIC_BACKEND_BASE || 'http://dev.api.qr-code.com',
            storageBase: process.env.NUXT_PUBLIC_STORAGE_BASE || 'http://localhost:8082',
            passportClientId: process.env.NUXT_PUBLIC_PASSPORT_CLIENT_ID || '',
            passportRedirectUri:
                process.env.NUXT_PUBLIC_PASSPORT_REDIRECT_URI || 'http://dev.qr-code.com/auth/callback',
        },
    },
    routeRules: {
        '/': { prerender: false },
        '/pricing': { prerender: true },
        '/dashboard/**': { ssr: false },
        '/qr-codes/**': { ssr: false },
        '/templates/**': { ssr: false },
        '/settings/**': { ssr: false },
        '/notifications/**': { ssr: false },
        '/billing/checkout': { ssr: false },
    },
    app: {
        head: {
            titleTemplate: '%s · Baboons QR-code',
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'color-scheme', content: 'light dark' },
                { name: 'description', content: 'Create free static QR codes and manage trackable dynamic QR codes.' },
            ],
            script: [
                {
                    innerHTML: `(function(){try{var t=localStorage.getItem('baboons-theme');if(t==='light'||t==='black'){document.documentElement.setAttribute('data-theme',t)}else{document.documentElement.removeAttribute('data-theme')}}catch(e){}})();`,
                    tagPosition: 'head',
                },
            ],
        },
    },
});
