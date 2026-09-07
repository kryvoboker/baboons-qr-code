export default defineEventHandler(async (event) => {
    try {
        try {
            await backendFetch(event, '/api/v1/auth/token', { method: 'DELETE' });
        } catch {
            // The access token may already be expired; session cleanup must still continue.
        }

        const response = await internalBackendFetchRaw(event, '/api/v1/auth/session', { method: 'DELETE' });
        for (const cookie of response.headers.getSetCookie?.() ?? []) {
            appendResponseHeader(event, 'set-cookie', cookie);
        }
    } finally {
        deleteCookie(event, 'bqr_access_token', { path: '/' });
        deleteCookie(event, 'bqr_refresh_token', { path: '/api' });
    }

    return { ok: true };
});
