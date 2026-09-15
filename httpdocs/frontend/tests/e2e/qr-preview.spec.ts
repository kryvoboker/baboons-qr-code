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
