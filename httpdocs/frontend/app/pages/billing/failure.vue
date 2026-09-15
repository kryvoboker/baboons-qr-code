<script setup lang="ts">useHead({title:'Payment failed'});</script>
<template>
    <section>
        <div class="container">
            <div class="mx-auto flex min-h-[65vh] max-w-xl items-center px-4 py-12">
                <div class="w-full text-center">
                    <div class="bg-error/10 text-error mx-auto flex size-16 items-center justify-center rounded-full">
                        <span class="icon-[tabler--x] size-9" />
                    </div>
                    <h1 class="mt-5 text-3xl font-semibold">Payment did not go through</h1>
                    <p class="text-base-content/60 mt-2">No new subscription was activated. You can retry or choose another plan. Existing QR codes are unchanged.</p>
                    <div class="mt-6 flex justify-center gap-3">
                        <NuxtLink class="btn btn-primary" to="/pricing">Try again</NuxtLink>
                        <NuxtLink class="btn btn-outline" to="/dashboard">Back to dashboard</NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
