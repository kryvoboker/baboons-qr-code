import { isRecord, setSessionStorageItem } from '~/utils/helpers';

export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.server) return;

    try {
        await $fetch('/api/bff/v1/auth/user');
    } catch (error: unknown) {
        setSessionStorageItem('baboons-return-to', to.fullPath);

        const errorStatus = isRecord(error)
            ? (error.statusCode ?? (isRecord(error.data) ? error.data.statusCode : undefined))
            : undefined;

        return navigateTo(errorStatus === 403 ? '/auth/verify-email' : '/auth/login');
    }
});
