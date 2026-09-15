import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import {
    arrayFrom,
    getLocalStorageItem,
    getSafeInternalPath,
    getSessionStorageJson,
    isArray,
    isRecord,
    parseJson,
    removeLocalStorageItem,
    setLocalStorageItem,
    setSessionStorageJson,
    stringifyJson,
} from '../app/utils/helpers.ts';
import { isPendingQrTemplate, isQrDraft } from '../app/utils/qr-validation.ts';

class MemoryStorage implements Storage {
    private readonly items = new Map<string, string>();

    get length(): number {
        return this.items.size;
    }

    clear(): void {
        this.items.clear();
    }

    getItem(key: string): string | null {
        return this.items.get(key) ?? null;
    }

    key(index: number): string | null {
        return arrayFrom(this.items.keys())[index] ?? null;
    }

    removeItem(key: string): void {
        this.items.delete(key);
    }

    setItem(key: string, value: string): void {
        this.items.set(key, String(value));
    }
}

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');

const setWindow = (storage: Storage = new MemoryStorage()): void => {
    Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: {
            localStorage: storage,
            sessionStorage: storage,
            location: { origin: 'https://app.example.test' },
        } as unknown as Window,
    });
};

afterEach(() => {
    if (originalWindow) {
        Object.defineProperty(globalThis, 'window', originalWindow);
    } else {
        Reflect.deleteProperty(globalThis, 'window');
    }
});

describe('browser storage helpers', () => {
    it('reads, writes, and removes local storage values', () => {
        setWindow();

        assert.equal(setLocalStorageItem('theme', 'light'), true);
        assert.equal(getLocalStorageItem('theme'), 'light');
        assert.equal(removeLocalStorageItem('theme'), true);
        assert.equal(getLocalStorageItem('theme'), null);
    });

    it('returns safe fallback values when browser storage is unavailable', () => {
        Reflect.deleteProperty(globalThis, 'window');

        assert.equal(getLocalStorageItem('theme'), null);
        assert.equal(setLocalStorageItem('theme', 'light'), false);
        assert.equal(removeLocalStorageItem('theme'), false);
    });

    it('returns safe fallback values when browser storage access throws', () => {
        Object.defineProperty(globalThis, 'window', {
            configurable: true,
            value: {
                get localStorage(): never {
                    throw new Error('Storage is blocked');
                },
            },
        });

        assert.equal(getLocalStorageItem('theme'), null);
        assert.equal(setLocalStorageItem('theme', 'light'), false);
    });

    it('stores and reads validated session JSON, ignoring malformed or unexpected values', () => {
        setWindow();
        const isString = (value: unknown): value is string => typeof value === 'string';

        assert.equal(setSessionStorageJson('draft', { name: 'Sample QR' }), true);
        assert.deepEqual(getSessionStorageJson('draft', isRecord), { name: 'Sample QR' });

        const malformedJsonStorage = new MemoryStorage();
        malformedJsonStorage.setItem('draft', '{broken');
        setWindow(malformedJsonStorage);
        assert.equal(getSessionStorageJson('draft', isString), null);

        const unexpectedValueStorage = new MemoryStorage();
        unexpectedValueStorage.setItem('draft', '12');
        setWindow(unexpectedValueStorage);
        assert.equal(getSessionStorageJson('draft', isString), null);
    });
});

describe('data helpers', () => {
    it('converts iterables and array-like values, with an optional mapper', () => {
        assert.deepEqual(arrayFrom(new Set(['a', 'b'])), ['a', 'b']);
        assert.deepEqual(
            arrayFrom(new Uint8Array([10, 15]), (value) => value.toString(16)),
            ['a', 'f'],
        );
        assert.deepEqual(arrayFrom(null), []);
    });

    it('distinguishes arrays from plain records', () => {
        assert.equal(isArray([]), true);
        assert.equal(isArray({}), false);
        assert.equal(isRecord({ value: true }), true);
        assert.equal(isRecord([]), false);
        assert.equal(isRecord(null), false);
    });

    it('parses only valid JSON matching the supplied type guard', () => {
        const isString = (value: unknown): value is string => typeof value === 'string';

        assert.equal(parseJson('"valid"', isString), 'valid');
        assert.equal(parseJson('12', isString), null);
        assert.equal(parseJson('{broken', isString), null);
        assert.equal(parseJson(null, isString), null);
    });

    it('serializes JSON safely and rejects values that cannot be represented', () => {
        assert.equal(stringifyJson({ value: 1 }), '{"value":1}');
        assert.equal(stringifyJson(undefined), null);

        const circular: { self?: unknown } = {};
        circular.self = circular;
        assert.equal(stringifyJson(circular), null);
    });

    it('accepts only internal relative return paths', () => {
        assert.equal(
            getSafeInternalPath('/dashboard?tab=qr#recent', 'https://app.example.test'),
            '/dashboard?tab=qr#recent',
        );
        assert.equal(getSafeInternalPath('//attacker.example/path', 'https://app.example.test'), null);
        assert.equal(getSafeInternalPath('https://attacker.example/path', 'https://app.example.test'), null);
        assert.equal(getSafeInternalPath('/\\attacker.example/path', 'https://app.example.test'), null);
        assert.equal(getSafeInternalPath('/javascript:alert(1)', 'https://app.example.test'), '/javascript:alert(1)');
    });
});

describe('persisted QR value validators', () => {
    const validDesign = {
        width: 720,
        height: 720,
        type: 'svg',
        margin: 12,
        dotsOptions: { color: '#111827', type: 'rounded' },
        cornersSquareOptions: { color: '#111827', type: 'extra-rounded' },
        cornersDotOptions: { color: '#111827', type: 'dot' },
        backgroundOptions: { color: '#ffffff' },
        imageOptions: { crossOrigin: 'anonymous', margin: 8, hideBackgroundDots: true },
        qrOptions: { errorCorrectionLevel: 'H' },
    };
    const validDraft = {
        name: 'Example QR',
        kind: 'url',
        mode: 'static',
        fields: { url: 'https://example.test' },
        data: 'https://example.test',
        destinationUrl: '',
        design: validDesign,
    };

    it('accepts a valid draft and rejects invalid QR design values', () => {
        assert.equal(isQrDraft(validDraft), true);
        assert.equal(isQrDraft({ ...validDraft, design: { ...validDesign, dotsOptions: { type: 'invalid' } } }), false);
    });

    it('validates pending template payloads before applying them', () => {
        assert.equal(isPendingQrTemplate({ kind: 'url', design: validDesign, name: 'Example QR' }), true);
        assert.equal(isPendingQrTemplate({ kind: 'url', design: [], name: 'Example QR' }), false);
    });
});