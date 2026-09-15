<script setup lang="ts">
import {
    getRegistrationFieldErrors,
    type RegistrationField,
    type RegistrationFieldErrors,
    usePassportAuth,
} from '~/composables/usePassportAuth';

useHead({ title: 'Create account' });
const { register } = usePassportAuth();
const form = reactive({ name: '', email: '', password: '' });
const pending = ref(false);
const error = ref('');
const registered = ref(false);
const fieldErrors = reactive<RegistrationFieldErrors>({});

const clearFieldError = (field: RegistrationField): void => {
    delete fieldErrors[field];
};

const submit = async () => {
    pending.value = true;
    error.value = '';
    clearFieldError('name');
    clearFieldError('email');
    clearFieldError('password');

    try {
        await register(form.name, form.email, form.password);
    } catch (caught: unknown) {
        const validationErrors = getRegistrationFieldErrors(caught);

        if (validationErrors) {
            Object.assign(fieldErrors, validationErrors);
        } else {
            error.value = 'Could not create the account right now. Please try again.';
        }

        pending.value = false;
        return;
    }

    registered.value = true;
    form.password = '';
    pending.value = false;
};
</script>
<template>
    <section>
        <div class="container">
            <div class="mx-auto max-w-lg px-4 py-12 sm:px-6">
                <div class="card border-base-content/10 border shadow-sm">
                    <div v-if="registered" class="card-body" role="status">
                        <span class="badge badge-success badge-soft">Account created</span>
                        <h1 class="card-title mt-2 text-2xl">Verify your email</h1>
                        <p class="text-base-content/70 text-sm">
                            We sent a verification link to <strong>{{ form.email }}</strong>. Open that link before signing in.
                        </p>
                        <NuxtLink class="btn btn-primary" to="/auth/login">Continue to sign in</NuxtLink>
                    </div>
                    <form v-else class="card-body" @submit.prevent="submit">
                        <div>
                            <span class="badge badge-primary badge-soft">Free account</span>
                            <h1 class="mt-3 text-2xl font-semibold">Save your QR codes and templates</h1>
                            <p class="text-base-content/60 mt-1 text-sm">You only need a paid plan when you create dynamic QR codes.</p>
                        </div>
                        <div v-if="error" class="alert alert-error alert-soft">{{ error }}</div>
                        <label class="form-control">
                            <span class="label-text mb-1">Name</span>
                            <input
                                id="register-name"
                                v-model="form.name"
                                class="input"
                                autocomplete="name"
                                :aria-invalid="Boolean(fieldErrors.name?.length)"
                                :aria-describedby="fieldErrors.name?.length ? 'register-name-error' : undefined"
                                required
                                @input="clearFieldError('name')"
                            />
                            <span
                                v-if="fieldErrors.name?.length"
                                id="register-name-error"
                                class="text-error mt-1 text-xs"
                                role="alert"
                            >
                                {{ fieldErrors.name[0] }}
                            </span>
                        </label>
                        <label class="form-control">
                            <span class="label-text mb-1">Email</span>
                            <input
                                id="register-email"
                                v-model="form.email"
                                type="email"
                                class="input"
                                autocomplete="email"
                                :aria-invalid="Boolean(fieldErrors.email?.length)"
                                :aria-describedby="fieldErrors.email?.length ? 'register-email-error' : undefined"
                                required
                                @input="clearFieldError('email')"
                            />
                            <span
                                v-if="fieldErrors.email?.length"
                                id="register-email-error"
                                class="text-error mt-1 text-xs"
                                role="alert"
                            >
                                {{ fieldErrors.email[0] }}
                            </span>
                        </label>
                        <label class="form-control">
                            <span class="label-text mb-1">Password</span>
                            <input
                                id="register-password"
                                v-model="form.password"
                                type="password"
                                class="input"
                                autocomplete="new-password"
                                minlength="10"
                                :aria-invalid="Boolean(fieldErrors.password?.length)"
                                :aria-describedby="fieldErrors.password?.length ? 'register-password-error' : undefined"
                                required
                                @input="clearFieldError('password')"
                            />
                            <span class="text-base-content/50 mt-1 text-xs">At least 10 characters.</span>
                            <span
                                v-if="fieldErrors.password?.length"
                                id="register-password-error"
                                class="text-error mt-1 text-xs"
                                role="alert"
                            >
                                {{ fieldErrors.password[0] }}
                            </span>
                        </label>
                        <button class="btn btn-primary" :disabled="pending">
                            <span v-if="pending" class="loading loading-spinner loading-sm" />Create account
                        </button>
                        <p class="text-base-content/60 text-center text-sm">Already registered? <NuxtLink class="link link-primary" to="/auth/login">Log in</NuxtLink></p>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>
