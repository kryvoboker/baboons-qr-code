export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const response = await internalBackendFetchRaw(event, '/api/v1/auth/forgot-password', {
        method: 'POST',
        body,
    });

    return response._data;
});
