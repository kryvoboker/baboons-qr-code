import { createHash, randomBytes } from 'node:crypto';

export default defineEventHandler((event) => {
    const config = useRuntimeConfig(event);
    const verifier = randomBytes(48).toString('base64url');
    const state = randomBytes(32).toString('base64url');
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    const cookieOptions = {
        httpOnly: true,
        secure: config.authCookieSecure,
        sameSite: 'lax' as const,
        path: '/api/auth',
        maxAge: 600,
    };

    setCookie(event, 'bqr_pkce_verifier', verifier, cookieOptions);
    setCookie(event, 'bqr_pkce_state', state, cookieOptions);

    const url = new URL('/oauth/authorize', config.public.backendBase);
    url.searchParams.set('client_id', config.public.passportClientId);
    url.searchParams.set('redirect_uri', config.public.passportRedirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'profile:read profile:write qr:read qr:write billing:read billing:write');
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');

    return { url: url.toString() };
});
