import { setSessionStorageItem } from '~/utils/helpers';

export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.server) return;

    try {
        await $fetch('/api/bff/v1/auth/user');
    } catch {
        setSessionStorageItem('baboons-return-to', to.fullPath);
        return navigateTo('/auth/login');
    }
});
