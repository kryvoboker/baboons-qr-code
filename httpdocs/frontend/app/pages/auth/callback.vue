<script setup lang="ts">
useHead({ title: 'Signing in' });

const route = useRoute();
const { finishCallback } = usePassportAuth();
const error = ref('');

onMounted(async () => {
    try {
        const code = String(route.query.code || '');
        const state = String(route.query.state || '');
        if (!code || !state) throw new Error('Missing OAuth callback parameters.');

        await finishCallback(code, state);

        const returnTo = sessionStorage.getItem('baboons-return-to');
        const pendingDraft = sessionStorage.getItem('baboons-pending-draft');
        sessionStorage.removeItem('baboons-return-to');

        if (returnTo) {
            await navigateTo(returnTo);
        } else if (pendingDraft) {
            await navigateTo('/#generator');
        } else {
            await navigateTo('/dashboard');
        }
    } catch (caught) {
        error.value = caught instanceof Error ? caught.message : 'Authentication failed.';
    }
});
</script>

<template>
    <section class="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4">
        <div class="text-center">
            <span v-if="!error" class="loading loading-spinner loading-lg text-primary" />
            <span v-else class="icon-[tabler--alert-triangle] text-error mx-auto size-10" />
            <h1 class="mt-4 text-xl font-semibold">
                {{ error ? 'Could not sign you in' : 'Finishing secure sign-in…' }}
            </h1>
            <p v-if="error" class="text-base-content/60 mt-2">{{ error }}</p>
            <NuxtLink v-if="error" to="/auth/login" class="btn btn-primary mt-4">Try again</NuxtLink>
        </div>
    </section>
</template>
