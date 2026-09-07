<script setup lang="ts">
const route = useRoute();
const email = ref(String(route.query.email || ''));
const token = ref(String(route.query.token || ''));
const password = ref('');
const confirmation = ref('');
const pending = ref(false);
const done = ref(false);
const errorMessage = ref('');

const submit = async () => {
    pending.value = true;
    errorMessage.value = '';

    try {
        await $fetch('/api/auth/reset-password', {
            method: 'POST',
            body: {
                email: email.value,
                token: token.value,
                password: password.value,
                password_confirmation: confirmation.value,
            },
        });
        done.value = true;
    } catch {
        errorMessage.value = 'The reset link is invalid or expired.';
    } finally {
        pending.value = false;
    }
};

useHead({ title: 'Reset password' });
</script>

<template>
    <main class="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
        <section class="card bg-base-100 border-base-content/10 w-full border shadow-sm">
            <div class="card-body gap-5">
                <div>
                    <p class="text-primary text-sm font-semibold">Account recovery</p>
                    <h1 class="text-2xl font-bold">Set a new password</h1>
                </div>

                <div v-if="done" class="alert alert-success">
                    <span class="icon-[tabler--circle-check] size-5" />
                    <span>Password updated. You can sign in now.</span>
                </div>

                <form v-else class="space-y-4" @submit.prevent="submit">
                    <label class="form-control">
                        <span class="label-text mb-1">Email</span>
                        <input v-model="email" class="input" type="email" autocomplete="email" required />
                    </label>
                    <label class="form-control">
                        <span class="label-text mb-1">New password</span>
                        <input
                            v-model="password"
                            class="input"
                            type="password"
                            minlength="10"
                            autocomplete="new-password"
                            required
                        />
                    </label>
                    <label class="form-control">
                        <span class="label-text mb-1">Repeat password</span>
                        <input
                            v-model="confirmation"
                            class="input"
                            type="password"
                            minlength="10"
                            autocomplete="new-password"
                            required
                        />
                    </label>
                    <p v-if="errorMessage" class="text-error text-sm">{{ errorMessage }}</p>
                    <button class="btn btn-primary w-full" :disabled="pending">
                        <span v-if="pending" class="loading loading-spinner loading-sm" />
                        Update password
                    </button>
                </form>

                <NuxtLink class="link link-primary text-sm" to="/auth/login">Back to sign in</NuxtLink>
            </div>
        </section>
    </main>
</template>
