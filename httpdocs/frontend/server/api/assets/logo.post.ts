import { Blob } from 'node:buffer';

export default defineEventHandler(async (event) => {
    const form = await readMultipartFormData(event);
    if (!form) {
        throw createError({ statusCode: 400, statusMessage: 'Multipart form data is required.' });
    }

    const logo = form.find((part) => part.name === 'logo' && part.filename);
    const guestKey = form.find((part) => part.name === 'guest_session_key');
    if (!logo) {
        throw createError({ statusCode: 422, statusMessage: 'Logo is required.' });
    }

    const outbound = new FormData();
    outbound.append(
        'logo',
        new Blob([logo.data], { type: logo.type || 'application/octet-stream' }),
        logo.filename || 'logo',
    );

    if (guestKey) {
        outbound.append('guest_session_key', guestKey.data.toString('utf8'));
    }

    const config = useRuntimeConfig(event);
    const accessToken = getCookie(event, 'bqr_access_token');
    const endpoint = accessToken ? '/api/v1/assets/logo' : '/api/v1/guest-assets/logo';

    return await $fetch(endpoint, {
        baseURL: config.backendInternalBase,
        method: 'POST',
        body: outbound,
        headers: {
            'x-baboons-bff-secret': config.bffSharedSecret,
            ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        },
    });
});
