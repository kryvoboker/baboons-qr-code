export default defineEventHandler(async (event) => {
    try {
        try {
            await backendFetch(event, '/api/v1/auth/token', { method: 'DELETE' });
        } catch {
            // Continue clearing cookies when the access token is already expired.
        }
    } finally {
        deleteCookie(event, 'bqr_access_token', { path: '/' });
        deleteCookie(event, 'bqr_refresh_token', { path: '/api' });
    }

    return { ok: true };
});
