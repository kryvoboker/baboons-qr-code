import { timingSafeEqual } from 'node:crypto';

type TokenResponse = { access_token: string; refresh_token?: string; expires_in: number };

export default defineEventHandler(async (event) => {
    const body = await readBody<{ code?: string; state?: string }>(event);
    const expectedState = getCookie(event, 'bqr_pkce_state');
    const verifier = getCookie(event, 'bqr_pkce_verifier');

    if (!body.code || !body.state || !expectedState || !verifier) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid OAuth callback.' });
    }

    const receivedState = Buffer.from(body.state);
    const storedState = Buffer.from(expectedState);
    if (receivedState.length !== storedState.length || !timingSafeEqual(receivedState, storedState)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid OAuth state.' });
    }

    const config = useRuntimeConfig(event);
    const token = await $fetch<TokenResponse>('/oauth/token', {
        baseURL: config.backendInternalBase,
        method: 'POST',
        body: {
            grant_type: 'authorization_code',
            client_id: config.public.passportClientId,
            redirect_uri: config.public.passportRedirectUri,
            code: body.code,
            code_verifier: verifier,
        },
    });

    persistPassportTokens(event, token);
    deleteCookie(event, 'bqr_pkce_state', { path: '/api/auth' });
    deleteCookie(event, 'bqr_pkce_verifier', { path: '/api/auth' });

    return { ok: true };
});

function persistPassportTokens(event: Parameters<typeof setCookie>[0], token: TokenResponse): void {
    const config = useRuntimeConfig(event);
    const cookieOptions = { httpOnly: true, secure: config.authCookieSecure, sameSite: 'lax' as const };

    setCookie(event, 'bqr_access_token', token.access_token, { ...cookieOptions, path: '/', maxAge: token.expires_in });
    if (token.refresh_token) {
        setCookie(event, 'bqr_refresh_token', token.refresh_token, {
            ...cookieOptions,
            sameSite: 'strict',
            path: '/api',
            maxAge: 60 * 60 * 24 * 30,
        });
    }
}
