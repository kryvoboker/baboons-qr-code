<script setup lang="ts">
import type { ApiUser } from '~/types/api';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });
useHead({ title: 'Profile settings' });

const form = reactive({ name: '', email: '', timezone: 'Europe/Kyiv', locale: 'en' });
const pending = ref(true);
const saving = ref(false);
const message = ref('');
const errorMessage = ref('');

const load = async () => {
    pending.value = true;
    try {
        const response = await $fetch<{ user: ApiUser }>('/api/bff/v1/auth/user');
        Object.assign(form, {
            name: response.user.name,
            email: response.user.email,
            timezone: response.user.timezone || 'Europe/Kyiv',
            locale: response.user.locale || 'en',
        });
    } catch {
        errorMessage.value = 'Could not load your profile.';
    } finally {
        pending.value = false;
    }
};

const save = async () => {
    saving.value = true;
    message.value = '';
    errorMessage.value = '';

    try {
        const response = await $fetch<{ data: ApiUser }>('/api/bff/v1/profile', {
            method: 'PATCH',
            body: { name: form.name, timezone: form.timezone, locale: form.locale },
        });
        Object.assign(form, response.data);
        message.value = 'Profile settings saved.';
    } catch {
        errorMessage.value = 'Could not save profile settings.';
    } finally {
        saving.value = false;
    }
};

onMounted(() => void load());
</script>

<template>
    <div class="mx-auto max-w-4xl">
        <h1 class="text-3xl font-semibold">Settings</h1>
        <div class="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
            <nav class="menu">
                <NuxtLink class="menu-item active" to="/settings/profile">
                    <span class="icon-[tabler--user] size-5" />Profile
                </NuxtLink>
                <NuxtLink class="menu-item" to="/settings/billing">
                    <span class="icon-[tabler--credit-card] size-5" />Billing
                </NuxtLink>
                <NuxtLink class="menu-item" to="/notifications">
                    <span class="icon-[tabler--bell] size-5" />Notifications
                </NuxtLink>
            </nav>

            <div class="card border-base-content/10 border">
                <div v-if="pending" class="flex justify-center py-20">
                    <span class="loading loading-spinner loading-lg text-primary" />
                </div>

                <form v-else class="card-body" @submit.prevent="save">
                    <h2 class="card-title">Profile</h2>
                    <div v-if="message" class="alert alert-success alert-soft text-sm">{{ message }}</div>
                    <div v-if="errorMessage" class="alert alert-error alert-soft text-sm">{{ errorMessage }}</div>

                    <label class="form-control">
                        <span class="label-text mb-1">Name</span>
                        <input v-model="form.name" class="input" maxlength="120" required />
                    </label>

                    <label class="form-control">
                        <span class="label-text mb-1">Email</span>
                        <input v-model="form.email" type="email" class="input" disabled />
                        <span class="text-base-content/50 mt-1 text-xs">
                            Email changes should use a dedicated re-verification flow and are intentionally not mixed into profile editing.
                        </span>
                    </label>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <label class="form-control">
                            <span class="label-text mb-1">Timezone</span>
                            <select v-model="form.timezone" class="select">
                                <option>Europe/Kyiv</option>
                                <option>Europe/Warsaw</option>
                                <option>Europe/Berlin</option>
                                <option>Europe/London</option>
                                <option>America/New_York</option>
                            </select>
                        </label>
                        <label class="form-control">
                            <span class="label-text mb-1">Language</span>
                            <select v-model="form.locale" class="select">
                                <option value="en">English</option>
                                <option value="uk">Українська</option>
                                <option value="ru">Русский</option>
                            </select>
                        </label>
                    </div>

                    <div class="card-actions justify-end">
                        <button class="btn btn-primary" :disabled="saving || !form.name.trim()">
                            <span v-if="saving" class="loading loading-spinner loading-sm" />
                            Save profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
