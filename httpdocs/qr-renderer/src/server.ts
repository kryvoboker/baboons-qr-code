import express from 'express';
import { renderQr, type RenderFormat } from './render.js';
import { saveQr } from './storage.js';

const app = express();
const port = Number(process.env.PORT || 3100);
const allowedFormats = new Set<RenderFormat>(['png', 'jpeg', 'webp', 'svg']);

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_request, response) => response.json({ ok: true }));

app.use('/v1', (request, response, next) => {
    const expected = process.env.QR_RENDERER_SHARED_SECRET || '';
    const provided = request.header('x-baboons-renderer-secret') || '';
    if (!expected || provided !== expected) {
        return response.status(401).json({ message: 'Invalid renderer credentials.' });
    }

    return next();
});

app.post('/v1/render', async (request, response, next) => {
    try {
        const format = String(request.body?.format || 'svg') as RenderFormat;
        if (!allowedFormats.has(format)) return response.status(422).json({ message: 'Unsupported format.' });
        const options = request.body?.options;
        if (!options || typeof options !== 'object') return response.status(422).json({ message: 'options is required.' });

        const buffer = await renderQr(options, format);
        response.type(format === 'svg' ? 'image/svg+xml' : `image/${format}`);
        return response.send(buffer);
    } catch (error) {
        return next(error);
    }
});

app.post('/v1/render-and-save', async (request, response, next) => {
    try {
        const format = String(request.body?.format || 'png') as RenderFormat;
        const storageKey = String(request.body?.storageKey || '');
        if (!allowedFormats.has(format)) return response.status(422).json({ message: 'Unsupported format.' });
        if (!request.body?.options || typeof request.body.options !== 'object') return response.status(422).json({ message: 'options is required.' });

        const buffer = await renderQr(request.body.options, format);
        const relativePath = await saveQr(storageKey, format, buffer);
        return response.status(201).json({ relativePath });
    } catch (error) {
        return next(error);
    }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.error(error);
    response.status(500).json({ message: 'QR render failed.' });
});

app.listen(port, '0.0.0.0', () => console.log(`Baboons QR renderer listening on :${port}`));
