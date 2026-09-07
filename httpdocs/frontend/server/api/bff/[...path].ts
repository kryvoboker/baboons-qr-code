export default defineEventHandler(async (event) => {
    const path = getRouterParam(event, 'path') || '';
    const method = getMethod(event);
    const body = ['GET', 'HEAD'].includes(method) ? undefined : await readBody(event);
    const query = getQuery(event);

    return await backendFetch(event, `/api/${path}`, { method, body, query });
});
