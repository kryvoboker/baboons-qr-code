<script setup lang="ts">useHead({title:'Payment successful'});</script>
<template>
    <section>
        <div class="container">
            <div class="mx-auto flex min-h-[65vh] max-w-xl items-center px-4 py-12">
                <div class="w-full text-center">
                    <div class="bg-success/10 text-success mx-auto flex size-16 items-center justify-center rounded-full">
                        <span class="icon-[tabler--check] size-9" />
                    </div>
                    <h1 class="mt-5 text-3xl font-semibold">Subscription activated</h1>
                    <p class="text-base-content/60 mt-2">Your dynamic QR limits and analytics access are ready. A payment confirmation will also appear in notifications.</p>
                    <div class="mt-6 flex justify-center gap-3">
                        <NuxtLink class="btn btn-primary" to="/dashboard">Open dashboard</NuxtLink>
                        <NuxtLink class="btn btn-outline" to="/#generator">Create QR</NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
