export default defineEventHandler(async (event) => {
    const body = await readBody<{ options: Record<string, unknown>; format?: string }>(event);
    const config = useRuntimeConfig(event);
    const format = body.format === 'svg' ? 'svg' : 'png';

    const response = await $fetch<ArrayBuffer>('/v1/render', {
        baseURL: config.qrRendererInternalBase,
        method: 'POST',
        body: { ...body, format },
        responseType: 'arrayBuffer',
        headers: { 'x-baboons-renderer-secret': config.qrRendererSharedSecret },
    });

    setResponseHeader(event, 'content-type', format === 'svg' ? 'image/svg+xml' : 'image/png');
    setResponseHeader(event, 'content-disposition', `attachment; filename="qr-code.${format}"`);
    return new Uint8Array(response);
});
