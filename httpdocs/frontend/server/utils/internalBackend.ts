import type { H3Event } from 'h3';

export const internalBackendFetchRaw = async (event: H3Event, path: string, options: Record<string, unknown> = {}) => {
    const config = useRuntimeConfig(event);
    const incomingCookie = getRequestHeader(event, 'cookie');

    return await $fetch.raw(path, {
        baseURL: config.backendInternalBase,
        ...options,
        headers: {
            accept: 'application/json',
            'x-baboons-bff-secret': config.bffSharedSecret,
            ...(incomingCookie ? { cookie: incomingCookie } : {}),
            ...((options.headers as Record<string, string> | undefined) ?? {}),
        },
    });
};
