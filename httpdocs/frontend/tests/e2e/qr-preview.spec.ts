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
