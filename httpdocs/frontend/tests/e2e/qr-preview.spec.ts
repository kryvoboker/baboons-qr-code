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
