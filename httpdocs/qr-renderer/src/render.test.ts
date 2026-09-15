import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import nodeCanvas from 'canvas';
import { renderQr } from './render.js';

test('renders a PNG with the requested dimensions', async () => {
    const result = await renderQr({ data: 'https://example.com', width: 256, height: 256 }, 'png');

    assert.deepEqual(result.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    assert.equal(result.readUInt32BE(16), 256);
    assert.equal(result.readUInt32BE(20), 256);
});

test('renders a JPEG with the requested dimensions', async () => {
    const result = await renderQr({ data: 'https://example.com', width: 320, height: 320 }, 'jpeg');

    assert.deepEqual(result.subarray(0, 2), Buffer.from([0xff, 0xd8]));
});

test('renders SVG markup containing the QR pattern', async () => {
    const result = await renderQr({ data: 'https://example.com' }, 'svg');

    assert.match(result.toString(), /<svg\b/);
    assert.match(result.toString(), /<(?:path|rect)\b/);
});

test('embeds a storage-hosted logo into SVG instead of exposing its internal URL', async (context) => {
    const originalPublicUrl = process.env.STORAGE_PUBLIC_URL;
    const originalInternalUrl = process.env.STORAGE_INTERNAL_URL;
    const server = createServer((request, response) => {
        if (request.url === '/images/uploaded-logo.png') {
            const logoCanvas = nodeCanvas.createCanvas(64, 64);
            const logoContext = logoCanvas.getContext('2d');
            logoContext.fillStyle = '#e11d48';
            logoContext.fillRect(0, 0, 64, 64);
            response.setHeader('Content-Type', 'image/png');
            response.end(logoCanvas.toBuffer('image/png'));
            return;
        }

        response.setHeader('Content-Type', 'image/svg+xml');
        response.end(
            '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="red"/></svg>',
        );
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    context.after(async () => {
        if (originalPublicUrl === undefined) delete process.env.STORAGE_PUBLIC_URL;
        else process.env.STORAGE_PUBLIC_URL = originalPublicUrl;
        if (originalInternalUrl === undefined) delete process.env.STORAGE_INTERNAL_URL;
        else process.env.STORAGE_INTERNAL_URL = originalInternalUrl;
        await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    });
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    process.env.STORAGE_PUBLIC_URL = 'https://storage.example.test';
    process.env.STORAGE_INTERNAL_URL = `http://127.0.0.1:${address.port}`;

    const result = await renderQr(
        {
            data: 'https://example.com',
            image: 'https://storage.example.test/images/logo.svg',
            imageOptions: { saveAsBlob: false },
        },
        'svg',
    );

    assert.match(result.toString(), /data:image\/png;base64,/);
    assert.doesNotMatch(result.toString(), /127\.0\.0\.1/);

    const png = await renderQr(
        {
            data: 'https://example.com',
            width: 256,
            height: 256,
            image: 'https://storage.example.test/images/logo.svg',
            imageOptions: { saveAsBlob: false },
        },
        'png',
    );
    const canvas = nodeCanvas.createCanvas(256, 256);
    const context2d = canvas.getContext('2d');
    const image = await nodeCanvas.loadImage(png);
    context2d.drawImage(image, 0, 0);

    assert.deepEqual([...context2d.getImageData(128, 128, 1, 1).data].slice(0, 3), [255, 0, 0]);

    const uploadedLogoQr = await renderQr(
        {
            data: 'https://example.com',
            width: 256,
            height: 256,
            image: 'https://storage.example.test/images/uploaded-logo.png',
        },
        'png',
    );
    const uploadedQrImage = await nodeCanvas.loadImage(uploadedLogoQr);
    context2d.clearRect(0, 0, 256, 256);
    context2d.drawImage(uploadedQrImage, 0, 0);

    assert.deepEqual([...context2d.getImageData(128, 128, 1, 1).data].slice(0, 3), [225, 29, 72]);
});
