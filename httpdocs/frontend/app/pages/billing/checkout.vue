<script setup lang="ts">
import type { ApiPlan } from '~/types/api';

definePageMeta({ middleware: 'auth' });
useHead({ title: 'Checkout' });

const route = useRoute();
const selectedCode = String(route.query.plan || 'creator');
const plan = ref<ApiPlan | null>(null);
const pending = ref(false);
const loadingPlan = ref(true);
const errorMessage = ref('');

const loadPlan = async () => {
    try {
        const response = await $fetch<{ data: ApiPlan[] }>('/api/bff/v1/billing/plans');
        plan.value = response.data.find((item) => item.code === selectedCode) || null;
        if (!plan.value) errorMessage.value = 'Unknown subscription plan.';
    } catch {
        errorMessage.value = 'Could not load subscription plan.';
    } finally {
        loadingPlan.value = false;
    }
};

const checkout = async () => {
    if (!plan.value) return;
    pending.value = true;
    errorMessage.value = '';

    try {
        const response = await $fetch<{ data: { checkout_url: string } }>('/api/bff/v1/billing/checkout', {
            method: 'POST',
            body: { plan_code: plan.value.code },
        });
        window.location.assign(response.data.checkout_url);
    } catch {
        errorMessage.value = 'Could not start checkout.';
    } finally {
        pending.value = false;
    }
};

onMounted(() => void loadPlan());
</script>

<template>
    <section>
        <div class="container">
            <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div class="mb-6">
            <NuxtLink class="btn btn-text btn-sm px-0" to="/pricing">
                <span class="icon-[tabler--arrow-left] size-4" />Back to plans
            </NuxtLink>
            <h1 class="mt-2 text-3xl font-semibold">Confirm your subscription</h1>
        </div>

        <div v-if="loadingPlan" class="flex justify-center py-20">
            <span class="loading loading-spinner loading-lg text-primary" />
        </div>
        <div v-else-if="errorMessage && !plan" class="alert alert-error alert-soft">{{ errorMessage }}</div>

        <div v-else-if="plan" class="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div class="card border-base-content/10 border">
                <div class="card-body">
                    <h2 class="card-title">Payment details</h2>
                    <div class="alert alert-soft alert-info">
                        <span class="icon-[tabler--shield-lock] size-5" />
                        <span class="text-sm">
                            Raw card data is never collected by the Nuxt or Laravel forms. The production BillingGateway should redirect to a PCI-compliant provider checkout.
                        </span>
                    </div>
                    <div class="border-base-content/10 rounded-box border p-4">
                        <p class="font-medium">Secure provider checkout</p>
                        <p class="text-base-content/60 mt-1 text-sm">Continue to create a checkout session on the backend.</p>
                    </div>
                    <div v-if="errorMessage" class="alert alert-error alert-soft text-sm">{{ errorMessage }}</div>
                    <button class="btn btn-primary" :disabled="pending" @click="checkout">
                        <span v-if="pending" class="loading loading-spinner loading-sm" />
                        Continue to secure payment
                    </button>
                </div>
            </div>

            <aside class="card border-base-content/10 border">
                <div class="card-body">
                    <h2 class="card-title">Order summary</h2>
                    <div class="flex justify-between"><span>{{ plan.name }} plan</span><span>{{ plan.currency }} {{ plan.price }}/mo</span></div>
                    <div class="divider my-1" />
                    <div class="flex justify-between font-semibold"><span>Due today</span><span>{{ plan.currency }} {{ plan.price }}</span></div>
                    <p class="text-base-content/50 text-xs">Recurring monthly until cancelled. Tax handling belongs to the selected payment provider and deployment jurisdiction.</p>
                </div>
            </aside>
        </div>
            </div>
        </div>
    </section>
</template>
