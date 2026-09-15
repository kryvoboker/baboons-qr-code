import { createRequire } from 'node:module';
import nodeCanvas from 'canvas';
import { JSDOM } from 'jsdom';

const require = createRequire(import.meta.url);
const { QRCodeStyling } = require('qr-code-styling/lib/qr-code-styling.common.js');

export type RenderFormat = 'png' | 'svg' | 'jpeg' | 'webp';
type QrOptions = Record<string, unknown> & { image?: string; imageOptions?: Record<string, unknown> };
const errorCorrectionCapacity: Record<string, number> = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };

const clampNumber = (value: unknown, fallback: number, minimum: number, maximum: number): number => {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.max(minimum, Math.min(maximum, Math.round(numeric)));
};

const embedImage = async (options: QrOptions): Promise<QrOptions> => {
    const image = options.image;
    if (!image) return options;

    const publicBase = process.env.STORAGE_PUBLIC_URL?.replace(/\/$/, '');
    const internalBase = process.env.STORAGE_INTERNAL_URL?.replace(/\/$/, '');
    const imagePath = image.slice((publicBase?.length ?? 0) + 1);
    const hasTraversal = decodeURIComponent(imagePath)
        .split('/')
        .some((segment) => segment === '.' || segment === '..');

    if (
        !publicBase ||
        !internalBase ||
        !image.startsWith(`${publicBase}/`) ||
        !imagePath.startsWith('images/') ||
        image.includes('?') ||
        image.includes('#') ||
        hasTraversal
    ) {
        throw new Error('QR logo must be hosted by the configured public storage origin.');
    }

    const imageResponse = await fetch(`${internalBase}/${imagePath}`, {
        signal: AbortSignal.timeout(5_000),
        redirect: 'error',
    });

    if (!imageResponse.ok) {
        throw new Error('QR logo could not be loaded from storage.');
    }

    const mimeType = imageResponse.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']);
    const contentLength = Number(imageResponse.headers.get('content-length'));

    if (
        !mimeType ||
        !allowedMimeTypes.has(mimeType) ||
        (Number.isFinite(contentLength) && contentLength > 2 * 1024 * 1024)
    ) {
        throw new Error('QR logo has an unsupported image type or size.');
    }

    const imageReader = imageResponse.body?.getReader();
    if (!imageReader) {
        throw new Error('QR logo response could not be read.');
    }

    const imageChunks: Uint8Array[] = [];
    let imageSize = 0;

    while (true) {
        const { done, value } = await imageReader.read();
        if (done) break;

        imageSize += value.length;
        if (imageSize > 2 * 1024 * 1024) {
            await imageReader.cancel();
            throw new Error('QR logo has an unsupported image type or size.');
        }

        imageChunks.push(value);
    }

    if (imageSize === 0) {
        throw new Error('QR logo has an unsupported image type or size.');
    }

    const imageBuffer = Buffer.concat(imageChunks);
    return { ...options, image: `data:${mimeType};base64,${imageBuffer.toString('base64')}` };
};

const normalizeRenderOptions = async (options: QrOptions): Promise<QrOptions> => {
    const normalized = await embedImage(options);
    const data = String(normalized.data ?? '');

    if (data.length > 16_384) {
        throw new Error('QR payload is too large.');
    }

    return {
        ...normalized,
        data,
        width: clampNumber(normalized.width, 900, 128, 1600),
        height: clampNumber(normalized.height, 900, 128, 1600),
        margin: clampNumber(normalized.margin, 24, 0, 128),
    };
};

export const renderQr = async (options: QrOptions, format: RenderFormat = 'png'): Promise<Buffer> => {
    const normalized = await normalizeRenderOptions(options);
    const image = normalized.image;
    const imageOptions = normalized.imageOptions ?? {};

    if (image && format !== 'svg') {
        const baseOptions = {
            ...normalized,
            image: undefined,
            type: 'canvas',
            imageOptions: { ...imageOptions, hideBackgroundDots: false },
        };
        const baseQrCode = new QRCodeStyling({
            width: 900,
            height: 900,
            margin: 24,
            ...baseOptions,
            jsdom: JSDOM,
            nodeCanvas,
        });
        const baseRaw = await baseQrCode.getRawData(format);
        if (!baseRaw) throw new Error('QR renderer returned no data.');

        const baseBuffer = Buffer.isBuffer(baseRaw)
            ? baseRaw
            : baseRaw instanceof ArrayBuffer
              ? Buffer.from(baseRaw)
              : Buffer.from(await baseRaw.arrayBuffer());
        const canvas = nodeCanvas.createCanvas(Number(normalized.width), Number(normalized.height));
        const context = canvas.getContext('2d');
        const [baseImage, logoImage] = await Promise.all([
            nodeCanvas.loadImage(baseBuffer),
            nodeCanvas.loadImage(image),
        ]);
        context.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

        const errorLevel = String(
            (normalized.qrOptions as { errorCorrectionLevel?: string } | undefined)?.errorCorrectionLevel ?? 'Q',
        );
        const maxLogoRatio = Math.sqrt(
            Number(imageOptions.imageSize ?? 0.4) * (errorCorrectionCapacity[errorLevel] ?? 0.25),
        );
        const qrArea = Math.min(canvas.width, canvas.height) - 2 * Number(normalized.margin);
        const maxLogoWidth = qrArea * maxLogoRatio;
        const imageRatio = logoImage.width / logoImage.height;
        const logoWidth = Math.min(maxLogoWidth, maxLogoWidth * imageRatio);
        const logoHeight = Math.min(maxLogoWidth, maxLogoWidth / imageRatio);
        const logoMargin = Number(imageOptions.margin ?? 0);
        const x = (canvas.width - logoWidth) / 2 + logoMargin;
        const y = (canvas.height - logoHeight) / 2 + logoMargin;

        context.fillStyle = String(
            (normalized.backgroundOptions as { color?: string } | undefined)?.color ?? '#ffffff',
        );
        context.fillRect((canvas.width - logoWidth) / 2, (canvas.height - logoHeight) / 2, logoWidth, logoHeight);
        context.drawImage(logoImage, x, y, logoWidth - 2 * logoMargin, logoHeight - 2 * logoMargin);

        if (format === 'jpeg') {
            return canvas.toBuffer('image/jpeg');
        }

        return canvas.toBuffer('image/png');
    }

    const qrCode = new QRCodeStyling({
        width: 900,
        height: 900,
        margin: 24,
        ...normalized,
        // Embed logos so previews and downloaded SVGs do not depend on Docker-only URLs.
        imageOptions: { ...imageOptions, saveAsBlob: true },
        type: format === 'svg' ? 'svg' : 'canvas',
        jsdom: JSDOM,
        nodeCanvas,
    });

    const raw = await qrCode.getRawData(format);
    if (!raw) throw new Error('QR renderer returned no data.');

    if (Buffer.isBuffer(raw)) return raw;
    if (raw instanceof ArrayBuffer) return Buffer.from(raw);

    return Buffer.from(await raw.arrayBuffer());
};
