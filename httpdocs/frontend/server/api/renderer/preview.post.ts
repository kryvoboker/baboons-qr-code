export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const config = useRuntimeConfig(event);
    const response = await $fetch<ArrayBuffer>('/v1/render', {
        baseURL: config.qrRendererInternalBase,
        method: 'POST',
        body: { ...body, format: 'svg' },
        responseType: 'arrayBuffer',
        headers: { 'x-baboons-renderer-secret': config.qrRendererSharedSecret },
    });

    setResponseHeader(event, 'content-type', 'image/svg+xml; charset=utf-8');
    return new Uint8Array(response);
});
