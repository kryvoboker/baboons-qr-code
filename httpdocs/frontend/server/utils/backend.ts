import type { H3Event } from 'h3';

type FetchOptions = Record<string, unknown>;
type TokenResponse = { access_token: string; refresh_token?: string; expires_in: number };

const persistTokens = (event: H3Event, token: TokenResponse): void => {
    const config = useRuntimeConfig(event);
    const cookieOptions = {
        httpOnly: true,
        secure: config.authCookieSecure,
        sameSite: 'lax' as const,
    };

    setCookie(event, 'bqr_access_token', token.access_token, {
        ...cookieOptions,
        path: '/',
        maxAge: token.expires_in,
    });

    if (token.refresh_token) {
        setCookie(event, 'bqr_refresh_token', token.refresh_token, {
            ...cookieOptions,
            sameSite: 'strict',
            path: '/api',
            maxAge: 60 * 60 * 24 * 30,
        });
    }
};

const refreshPassportToken = async (event: H3Event): Promise<string | null> => {
    const refreshToken = getCookie(event, 'bqr_refresh_token');
    if (!refreshToken) return null;

    const config = useRuntimeConfig(event);

    try {
        const token = await $fetch<TokenResponse>('/oauth/token', {
            baseURL: config.backendInternalBase,
            method: 'POST',
            body: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: config.public.passportClientId,
            },
        });

        persistTokens(event, token);
        return token.access_token;
    } catch {
        deleteCookie(event, 'bqr_access_token', { path: '/' });
        deleteCookie(event, 'bqr_refresh_token', { path: '/api' });
        return null;
    }
};

export const backendFetch = async <T>(
    event: H3Event,
    path: string,
    options: FetchOptions = {},
): Promise<T> => {
    const config = useRuntimeConfig(event);
    const request = async (accessToken?: string) => await $fetch<T>(path, {
        baseURL: config.backendInternalBase,
        ...options,
        headers: {
            accept: 'application/json',
            'x-baboons-bff-secret': config.bffSharedSecret,
            ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
            ...((options.headers as Record<string, string> | undefined) ?? {}),
        },
    });

    const accessToken = getCookie(event, 'bqr_access_token');

    try {
        return await request(accessToken);
    } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status !== 401) throw error;

        const refreshed = await refreshPassportToken(event);
        if (!refreshed) throw error;

        return await request(refreshed);
    }
};
