import { isArray, isRecord } from '~/utils/helpers';

export type RegistrationField = 'name' | 'email' | 'password';
export type RegistrationFieldErrors = Partial<Record<RegistrationField, string[]>>;

export const getRegistrationFieldErrors = (error: unknown): RegistrationFieldErrors | null => {
    if (!isRecord(error) || !isRecord(error.data) || !isRecord(error.data.errors)) {
        return null;
    }

    const fieldErrors: RegistrationFieldErrors = {};

    for (const field of ['name', 'email', 'password'] as const) {
        const messages = error.data.errors[field];

        if (isArray(messages)) {
            const safeMessages = messages.filter((message): message is string => typeof message === 'string');

            if (safeMessages.length > 0) {
                fieldErrors[field] = safeMessages;
            }
        }
    }

    return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
};

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
