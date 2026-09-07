export const usePassportAuth = () => {
    const login = async (): Promise<void> => {
        const response = await $fetch<{ url: string }>('/api/auth/start');
        window.location.assign(response.url);
    };

    const register = async (name: string, email: string, password: string): Promise<void> => {
        await $fetch('/api/auth/register', {
            method: 'POST',
            body: { name, email, password, password_confirmation: password },
        });

        await login();
    };

    const finishCallback = async (code: string, state: string): Promise<void> => {
        await $fetch('/api/auth/callback', { method: 'POST', body: { code, state } });
    };

    const logout = async (): Promise<void> => {
        await $fetch('/api/auth/logout', { method: 'POST' });
        await navigateTo('/');
    };

    return { login, register, finishCallback, logout };
};
