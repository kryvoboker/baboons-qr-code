import { expect, test } from '@playwright/test';

test('BFF returns safe Laravel field errors for registration without leaking a stack trace', async ({ page }) => {
    await page.goto('/auth/register');

    const result = await page.evaluate(async () => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        return { status: response.status, body: await response.json() };
    });

    expect(result.status).toBe(422);
    expect(result.body.errors).toMatchObject({
        name: expect.any(Array),
        email: expect.any(Array),
        password: expect.any(Array),
    });
    expect(result.body).not.toHaveProperty('stack');
    expect(result.body).not.toHaveProperty('data');
});

test('PKCE start returns a public authorization URL and keeps temporary secrets HttpOnly', async ({ page }) => {
    await page.goto('/auth/login');

    const result = await page.evaluate(async () => {
        const response = await fetch('/api/auth/start');
        const body = await response.json();
        const authorizationUrl = new URL(body.url);

        return {
            status: response.status,
            url: {
                hostname: authorizationUrl.hostname,
                pathname: authorizationUrl.pathname,
                clientId: authorizationUrl.searchParams.get('client_id'),
                redirectUri: authorizationUrl.searchParams.get('redirect_uri'),
                responseType: authorizationUrl.searchParams.get('response_type'),
                state: authorizationUrl.searchParams.get('state'),
                challenge: authorizationUrl.searchParams.get('code_challenge'),
                challengeMethod: authorizationUrl.searchParams.get('code_challenge_method'),
            },
            pkceCookiesVisibleToJavaScript: document.cookie
                .split(';')
                .some((cookie) => cookie.trim().startsWith('bqr_pkce_')),
        };
    });

    expect(result.status).toBe(200);
    expect(result.url.pathname).toBe('/oauth/authorize');
    expect(result.url.clientId).toBeTruthy();
    expect(new URL(result.url.redirectUri ?? '').pathname).toBe('/auth/callback');
    expect(result.url.responseType).toBe('code');
    expect(result.url.state).toBeTruthy();
    expect(result.url.challenge).toBeTruthy();
    expect(result.url.challengeMethod).toBe('S256');
    expect(result.pkceCookiesVisibleToJavaScript).toBe(false);
});
