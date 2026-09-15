import type { QrDesign, QrDraft, QrKind } from '../types/qr.ts';
import { isRecord } from './helpers.ts';

const qrKinds: readonly QrKind[] = [
    'url',
    'text',
    'wifi',
    'vcard',
    'email',
    'phone',
    'sms',
    'whatsapp',
    'telegram',
    'location',
    'event',
    'file',
];

const dotStyles = ['dots', 'rounded', 'classy', 'classy-rounded', 'square', 'extra-rounded'] as const;
const cornerDotStyles = ['dot', 'square', ...dotStyles] as const;
const cornerSquareStyles = ['dot', 'square', ...dotStyles] as const;
const errorCorrectionLevels = ['L', 'M', 'Q', 'H'] as const;

const isOneOf = <T extends string>(value: unknown, options: readonly T[]): value is T =>
    typeof value === 'string' && options.includes(value as T);

export const isQrKind = (value: unknown): value is QrKind => isOneOf(value, qrKinds);

const isQrDesign = (value: unknown): value is QrDesign => {
    if (!isRecord(value) || !isRecord(value.dotsOptions) || !isRecord(value.cornersSquareOptions)) {
        return false;
    }

    if (!isRecord(value.cornersDotOptions) || !isRecord(value.backgroundOptions)) {
        return false;
    }

    if (!isRecord(value.imageOptions) || !isRecord(value.qrOptions)) {
        return false;
    }

    return (
        typeof value.width === 'number' &&
        Number.isFinite(value.width) &&
        value.width > 0 &&
        typeof value.height === 'number' &&
        Number.isFinite(value.height) &&
        value.height > 0 &&
        (value.type === 'svg' || value.type === 'canvas') &&
        typeof value.margin === 'number' &&
        Number.isFinite(value.margin) &&
        value.margin >= 0 &&
        typeof value.dotsOptions.color === 'string' &&
        isOneOf(value.dotsOptions.type, dotStyles) &&
        typeof value.cornersSquareOptions.color === 'string' &&
        isOneOf(value.cornersSquareOptions.type, cornerSquareStyles) &&
        typeof value.cornersDotOptions.color === 'string' &&
        isOneOf(value.cornersDotOptions.type, cornerDotStyles) &&
        typeof value.backgroundOptions.color === 'string' &&
        (value.image === undefined || typeof value.image === 'string') &&
        value.imageOptions.crossOrigin === 'anonymous' &&
        typeof value.imageOptions.margin === 'number' &&
        Number.isFinite(value.imageOptions.margin) &&
        value.imageOptions.margin >= 0 &&
        typeof value.imageOptions.hideBackgroundDots === 'boolean' &&
        isOneOf(value.qrOptions.errorCorrectionLevel, errorCorrectionLevels)
    );
};

export const isQrDraft = (value: unknown): value is QrDraft => {
    if (!isRecord(value) || !isRecord(value.fields)) {
        return false;
    }

    const hasValidFields = Object.values(value.fields).every(
        (fieldValue) => typeof fieldValue === 'string' || typeof fieldValue === 'boolean',
    );

    return (
        typeof value.name === 'string' &&
        isQrKind(value.kind) &&
        (value.mode === 'static' || value.mode === 'dynamic') &&
        hasValidFields &&
        typeof value.data === 'string' &&
        typeof value.destinationUrl === 'string' &&
        (value.folderId === undefined || typeof value.folderId === 'number') &&
        isQrDesign(value.design)
    );
};

export interface PendingQrTemplate {
    kind: QrKind;
    design: QrDesign;
    name: string;
}

export const isPendingQrTemplate = (value: unknown): value is PendingQrTemplate =>
    isRecord(value) && isQrKind(value.kind) && isQrDesign(value.design) && typeof value.name === 'string';
