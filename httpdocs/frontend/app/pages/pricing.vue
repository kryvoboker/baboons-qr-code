<script setup lang="ts">
import type { ApiPlan } from '~/types/api';

useHead({ title: 'Pricing' });
const route = useRoute();
const plans = ref<ApiPlan[]>([]);
const pending = ref(true);
const errorMessage = ref('');

const audience: Record<string, string> = {
    starter: 'Personal projects',
    creator: 'Freelancers & small teams',
    business: 'Campaign-heavy businesses',
};

const load = async () => {
    try {
        const response = await $fetch<{ data: ApiPlan[] }>('/api/bff/v1/billing/plans');
        plans.value = response.data;
    } catch {
        errorMessage.value = 'Could not load subscription plans.';
    } finally {
        pending.value = false;
    }
};

onMounted(() => void load());
</script>

<template>
    <section>
        <div class="container">
            <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
            <span class="badge badge-primary badge-soft">Simple monthly pricing</span>
            <h1 class="mt-3 text-4xl font-semibold">Pay for dynamic control, not for basic QR codes.</h1>
            <p class="text-base-content/60 mt-3">
                Static QR generation remains free. Upgrade for editable destinations, analytics, saved templates and higher limits.
            </p>
            <div v-if="route.query.reason === 'dynamic'" class="alert alert-info alert-soft mt-5 text-start">
                <span class="icon-[tabler--sparkles] size-5" />
                <span>Your QR draft is saved locally. Choose a plan, then return to the generator to continue.</span>
            </div>
        </div>

        <div v-if="errorMessage" class="alert alert-error alert-soft mx-auto mt-8 max-w-2xl">{{ errorMessage }}</div>
        <div v-if="pending" class="flex justify-center py-20">
            <span class="loading loading-spinner loading-lg text-primary" />
        </div>

        <div v-else class="mt-10 grid gap-5 lg:grid-cols-3">
            <article
                v-for="plan in plans"
                :key="plan.code"
                :class="['card border bg-base-100', plan.code === 'creator' ? 'border-primary shadow-lg' : 'border-base-content/10']"
            >
                <div class="card-body">
                    <div class="flex items-center justify-between">
                        <h2 class="card-title">{{ plan.name }}</h2>
                        <span v-if="plan.code === 'creator'" class="badge badge-primary">Most popular</span>
                    </div>
                    <p class="text-base-content/60 text-sm">{{ audience[plan.code] || 'Dynamic QR projects' }}</p>
                    <div class="my-4">
                        <span class="text-4xl font-semibold">{{ plan.currency }} {{ plan.price }}</span>
                        <span class="text-base-content/50"> / month</span>
                    </div>
                    <ul class="space-y-3 text-sm">
                        <li><span class="icon-[tabler--check] text-success me-2 inline-block size-4" />{{ plan.dynamic_qr }} dynamic QR codes</li>
                        <li><span class="icon-[tabler--check] text-success me-2 inline-block size-4" />{{ plan.scans.toLocaleString() }} scans / month</li>
                        <li><span class="icon-[tabler--check] text-success me-2 inline-block size-4" />Custom designs & saved templates</li>
                        <li><span class="icon-[tabler--check] text-success me-2 inline-block size-4" />Scan analytics</li>
                    </ul>
                    <NuxtLink
                        :to="`/billing/checkout?plan=${plan.code}`"
                        :class="['btn mt-4 w-full', plan.code === 'creator' ? 'btn-primary' : 'btn-outline']"
                    >
                        Choose {{ plan.name }}
                    </NuxtLink>
                </div>
            </article>
        </div>
            </div>
        </div>
    </section>
</template>
