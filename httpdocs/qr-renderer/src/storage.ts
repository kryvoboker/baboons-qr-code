import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { RenderFormat } from './render.js';

const root = process.env.SHARED_STORAGE_PATH || '/shared/storage';
const allowedKey = /^(?:guest-)?[a-f0-9]{64}$/;

export async function saveQr(storageKey: string, format: RenderFormat, data: Buffer): Promise<string> {
    if (!allowedKey.test(storageKey)) throw new Error('Invalid storage key.');

    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const relativeDir = path.posix.join('images', 'qr-code', storageKey, year, month);
    const absoluteDir = path.join(root, 'app', 'public', relativeDir);
    await mkdir(absoluteDir, { recursive: true });

    const fileName = `${randomUUID()}.${format}`;
    await writeFile(path.join(absoluteDir, fileName), data, { flag: 'wx' });
    return path.posix.join(relativeDir, fileName);
}
