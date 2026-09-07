import { createRequire } from 'node:module';
import nodeCanvas from 'canvas';
import { JSDOM } from 'jsdom';

const require = createRequire(import.meta.url);
const QRCodeStyling = require('qr-code-styling/lib/qr-code-styling.common.js');

export type RenderFormat = 'png' | 'svg' | 'jpeg' | 'webp';
type QrOptions = Record<string, unknown> & { image?: string };

const clampNumber = (value: unknown, fallback: number, minimum: number, maximum: number): number => {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.max(minimum, Math.min(maximum, Math.round(numeric)));
};

const normalizeImageUrl = (options: QrOptions): QrOptions => {
    const image = options.image;
    if (!image) return options;

    const publicBase = process.env.STORAGE_PUBLIC_URL?.replace(/\/$/, '');
    const internalBase = process.env.STORAGE_INTERNAL_URL?.replace(/\/$/, '');

    if (!publicBase || !internalBase || !image.startsWith(`${publicBase}/`)) {
        throw new Error('QR logo must be hosted by the configured public storage origin.');
    }

    return {
        ...options,
        image: `${internalBase}/${image.slice(publicBase.length + 1)}`,
    };
};

const normalizeRenderOptions = (options: QrOptions): QrOptions => {
    const normalized = normalizeImageUrl(options);
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

export const renderQr = async (
    options: QrOptions,
    format: RenderFormat = 'png',
): Promise<Buffer> => {
    const normalized = normalizeRenderOptions(options);
    const qrCode = new QRCodeStyling({
        width: 900,
        height: 900,
        margin: 24,
        ...normalized,
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
