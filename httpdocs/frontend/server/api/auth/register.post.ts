export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const response = await internalBackendFetchRaw(event, '/api/v1/auth/register', {
        method: 'POST',
        body,
    });

    for (const cookie of response.headers.getSetCookie?.() ?? []) {
        appendResponseHeader(event, 'set-cookie', cookie);
    }

    return response._data;
});
