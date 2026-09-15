import type { FetchError } from 'ofetch';
import { isArray, isRecord } from '~/utils/helpers';

const registrationFields = ['name', 'email', 'password'] as const;

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    try {
        const response = await internalBackendFetchRaw(event, '/api/v1/auth/register', {
            method: 'POST',
            body,
        });

        for (const cookie of response.headers.getSetCookie?.() ?? []) {
            appendResponseHeader(event, 'set-cookie', cookie);
        }

        return response._data;
    } catch (error: unknown) {
        const backendError = error as FetchError<{ errors?: unknown }>;

        if (backendError.response?.status === 422) {
            setResponseStatus(event, 422, 'Unprocessable Content');

            return { errors: extractRegistrationErrors(backendError.data?.errors) };
        }

        throw createError({
            statusCode: 502,
            statusMessage: 'Registration service is unavailable.',
        });
    }
});

function extractRegistrationErrors(errors: unknown): Partial<Record<(typeof registrationFields)[number], string[]>> {
    if (!isRecord(errors)) {
        return {};
    }

    const registrationErrors: Partial<Record<(typeof registrationFields)[number], string[]>> = {};

    for (const field of registrationFields) {
        const messages = errors[field];

        if (isArray(messages)) {
            const safeMessages = messages.filter((message): message is string => typeof message === 'string');

            if (safeMessages.length > 0) {
                registrationErrors[field] = safeMessages;
            }
        }
    }

    return registrationErrors;
}
