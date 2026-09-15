<script setup lang="ts">
const route = useRoute();
const isVerified = computed(() => route.query.verified === '1');

useHead({ title: isVerified.value ? 'Email verified' : 'Verify your email' });
</script>

<template>
    <section>
        <div class="container">
            <div class="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4 py-12">
                <div class="card border-base-content/10 bg-base-100 w-full border shadow-sm">
                    <div class="card-body items-center text-center">
                        <span
                            :class="isVerified ? 'badge-success' : 'badge-primary'"
                            class="badge badge-soft"
                        >
                            {{ isVerified ? 'Email verified' : 'One more step' }}
                        </span>
                        <h1 class="card-title mt-2 text-2xl">
                            {{ isVerified ? 'Your email is confirmed' : 'Check your email' }}
                        </h1>
                        <p class="text-base-content/70 text-sm">
                            {{
                                isVerified
                                    ? 'Your account is ready. Continue to secure sign-in to open your QR-code workspace.'
                                    : 'Open the signed verification link we sent after registration. You can sign in once your email is confirmed.'
                            }}
                        </p>
                        <NuxtLink class="btn btn-primary mt-2" to="/auth/login">Continue to sign in</NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
