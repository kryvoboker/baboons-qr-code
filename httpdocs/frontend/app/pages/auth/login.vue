<script setup lang="ts">
useHead({ title: 'Log in' });
const { login } = usePassportAuth();
const pending = ref(false);
const error = ref('');
const submit = async () => {
    pending.value = true;
    error.value = '';
    try {
        await login();
    } catch {
        error.value = 'Could not start secure sign-in.';
        pending.value = false;
    }
};
</script>
<template>
    <section>
        <div class="container">
            <div class="mx-auto grid min-h-[calc(100vh-140px)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
                <div class="hidden pr-12 lg:block">
                    <span class="badge badge-primary badge-soft">Welcome back</span>
                    <h1 class="mt-4 text-4xl font-semibold">Your QR codes, destinations and analytics in one clean workspace.</h1>
                    <p class="text-base-content/60 mt-3">Baboons keeps the dashboard intentionally boring: your codes, your folders, your scans. No maze of marketing tools.</p>
                </div>
                <div class="card border-base-content/10 bg-base-100 mx-auto w-full max-w-md border shadow-sm">
                    <form class="card-body" @submit.prevent="submit">
                        <h1 class="card-title text-2xl">Log in</h1>
                        <p class="text-base-content/60 text-sm">You will sign in on Laravel Passport using OAuth2 Authorization Code with PKCE.</p>
                        <div v-if="error" class="alert alert-error alert-soft text-sm">{{ error }}</div>
                        <button class="btn btn-primary" :disabled="pending">
                            <span v-if="pending" class="loading loading-spinner loading-sm" />Continue to secure sign-in
                        </button>
                        <div class="divider">New here?</div>
                        <NuxtLink class="btn btn-outline" to="/auth/register">Create account</NuxtLink>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>
