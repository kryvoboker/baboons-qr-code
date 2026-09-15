import { expect, test } from '@playwright/test';

test('renders the QR preview as SVG without browser errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    let previewResponse: { status: number; contentType: string | undefined } | undefined;

    page.on('console', (message) => {
        if (message.type() === 'error') {
            consoleErrors.push(message.text());
        }
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('response', async (response) => {
        if (new URL(response.url()).pathname === '/api/renderer/preview') {
            previewResponse = {
                status: response.status(),
                contentType: response.headers()['content-type'],
            };
        }
    });

    await page.goto('/');

    const preview = page.getByRole('img', { name: 'QR code preview' });
    await expect(preview).toBeVisible();
    await expect.poll(() => preview.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

    expect(previewResponse).toEqual({
        status: 200,
        contentType: expect.stringContaining('image/svg+xml'),
    });
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
});

test('applies the selected one-pixel size and image format to preview rendering', async ({ page }) => {
    let previewRequest: { format: string; width: number; height: number } | undefined;
    let previewResponse: { status: number; contentType: string | undefined } | undefined;

    page.on('request', (request) => {
        if (new URL(request.url()).pathname === '/api/renderer/preview') {
            const body = request.postDataJSON() as {
                format: string;
                options: { width: number; height: number };
            };
            previewRequest = {
                format: body.format,
                width: body.options.width,
                height: body.options.height,
            };
        }
    });
    page.on('response', (response) => {
        if (new URL(response.url()).pathname === '/api/renderer/preview') {
            previewResponse = {
                status: response.status(),
                contentType: response.headers()['content-type'],
            };
        }
    });

    await page.goto('/');
    await expect(page.getByRole('img', { name: 'QR code preview' })).toBeVisible();
    await expect(page.getByText('720 px')).toBeVisible();

    await page.getByRole('slider', { name: 'QR code image size' }).press('ArrowRight');
    await expect(page.getByText('721 px')).toBeVisible();
    await page.getByRole('radio', { name: 'PNG' }).check();

    await expect.poll(() => previewRequest).toEqual({ format: 'png', width: 721, height: 721 });
    await expect.poll(() => previewResponse?.contentType).toContain('image/png');
    expect(previewResponse?.status).toBe(200);

    await page.getByRole('radio', { name: 'JPG' }).check();
    await expect.poll(() => previewRequest?.format).toBe('jpg');
    await expect.poll(() => previewResponse?.contentType).toContain('image/jpeg');
    expect(previewResponse?.status).toBe(200);
});

test('renders a selected logo in raster QR previews', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('img', { name: 'QR code preview' })).toBeVisible();

    const presetLogos = ['facebook', 'instagram', 'telegram', 'viber', 'whatsapp', 'x', 'youtube'];
    for (const logoName of presetLogos) {
        const logoSvg = await page.evaluate(async (name) => {
            const response = await fetch(`/images/social/${name}.svg`);
            return response.text();
        }, logoName);

        expect(logoSvg).not.toMatch(/<text\b/i);
        expect(logoSvg).toMatch(/<(?:path|circle|rect)\b/i);
    }

    await page.getByRole('button', { name: 'Telegram', exact: true }).click();

    for (const format of ['SVG', 'PNG', 'JPG'] as const) {
        await page.getByRole('radio', { name: format }).check();
        const image = page.getByRole('img', { name: 'QR code preview' });
        const readCenterPixel = () =>
            image.evaluate((element) => {
                const preview = element as HTMLImageElement;
                if (!preview.complete || preview.naturalWidth === 0) return null;

                const canvas = document.createElement('canvas');
                canvas.width = preview.naturalWidth;
                canvas.height = preview.naturalHeight;
                const context = canvas.getContext('2d');
                if (!context) return null;

                context.drawImage(preview, 0, 0);
                return [...context.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data].slice(0, 3);
            });

        await expect
            .poll(async () => {
                const pixel = await readCenterPixel();
                return pixel !== null && pixel[2] > pixel[1] && pixel[2] > pixel[0];
            })
            .toBe(true);

        const logoColor = await readCenterPixel();
        expect(logoColor).not.toBeNull();
        if (!logoColor) throw new Error('QR preview logo pixel could not be read.');
        expect(logoColor[2]).toBeGreaterThan(logoColor[1]);
        expect(logoColor[2]).toBeGreaterThan(logoColor[0]);
    }
});

test('downloads the selected image format with the matching file extension', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('img', { name: 'QR code preview' })).toBeVisible();

    for (const format of ['svg', 'png', 'jpg'] as const) {
        await page.getByRole('radio', { name: format.toUpperCase() }).check();

        const downloadPromise = page.waitForEvent('download');
        const responsePromise = page.waitForResponse(
            (response) => new URL(response.url()).pathname === '/api/renderer/download',
        );

        await page.getByRole('button', { name: 'Download' }).click();

        const [download, response] = await Promise.all([downloadPromise, responsePromise]);

        expect(download.suggestedFilename()).toBe(`My QR code.${format}`);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain(
            format === 'svg' ? 'image/svg+xml' : format === 'jpg' ? 'image/jpeg' : 'image/png',
        );
    }
});

test('applies the selected theme and restores it after reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('baboons-theme'));
    await page.reload();
    await expect(page.getByRole('img', { name: 'QR code preview' })).toBeVisible();

    const appRoot = page.locator('#__nuxt');
    const lightPalette = await appRoot.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--color-base-100').trim(),
    );

    await page.getByRole('button', { name: 'Theme' }).click();
    await page.getByRole('button', { name: 'Dark' }).click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'black');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('baboons-theme'))).toBe('black');
    await expect
        .poll(() =>
            appRoot.evaluate((element) => getComputedStyle(element).getPropertyValue('--color-base-100').trim()),
        )
        .not.toBe(lightPalette);

    await page.reload();

    await expect(page.getByRole('img', { name: 'QR code preview' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'black');
    await expect
        .poll(() =>
            appRoot.evaluate((element) => getComputedStyle(element).getPropertyValue('--color-base-100').trim()),
        )
        .not.toBe(lightPalette);
});
