export default defineEventHandler(async (event) => {
    const body = await readBody<{ options: Record<string, unknown>; format?: 'svg' | 'png' | 'jpg' }>(event);
    const config = useRuntimeConfig(event);
    const format = body.format ?? 'png';
    if (!['svg', 'png', 'jpg'].includes(format)) {
        throw createError({ statusCode: 422, statusMessage: 'Unsupported QR image format.' });
    }

    const rendererFormat = format === 'jpg' ? 'jpeg' : format;

    const response = await $fetch<ArrayBuffer>('/v1/render', {
        baseURL: config.qrRendererInternalBase,
        method: 'POST',
        body: { ...body, format: rendererFormat },
        responseType: 'arrayBuffer',
        headers: { 'x-baboons-renderer-secret': config.qrRendererSharedSecret },
    });

    const contentType = format === 'svg' ? 'image/svg+xml' : format === 'jpg' ? 'image/jpeg' : 'image/png';
    setResponseHeader(event, 'content-type', contentType);
    setResponseHeader(event, 'content-disposition', `attachment; filename="qr-code.${format}"`);
    return new Uint8Array(response);
});
