<script setup lang="ts">
import type { ApiPlan, ApiSubscription, DashboardData } from '~/types/api';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });
useHead({ title: 'Billing settings' });

const subscription = ref<ApiSubscription | null>(null);
const plan = ref<ApiPlan | null>(null);
const usage = ref<DashboardData | null>(null);
const pending = ref(true);
const errorMessage = ref('');

const percent = (value: number, limit: number | null | undefined) => {
    if (!limit || limit <= 0) return 0;
    return Math.min(100, Math.round((value / limit) * 100));
};

const formatDate = (value: string | null) =>
    value
        ? new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))
        : '—';

const load = async () => {
    pending.value = true;
    try {
        const [subscriptionResponse, plansResponse, dashboardResponse] = await Promise.all([
            $fetch<{ data: ApiSubscription | null }>('/api/bff/v1/billing/subscription'),
            $fetch<{ data: ApiPlan[] }>('/api/bff/v1/billing/plans'),
            $fetch<{ data: DashboardData }>('/api/bff/v1/dashboard'),
        ]);
        subscription.value = subscriptionResponse.data;
        plan.value = plansResponse.data.find((item) => item.code === subscription.value?.plan_code) || null;
        usage.value = dashboardResponse.data;
    } catch {
        errorMessage.value = 'Could not load billing information.';
    } finally {
        pending.value = false;
    }
};

onMounted(() => void load());
</script>

<template>
    <div class="mx-auto max-w-4xl">
        <h1 class="text-3xl font-semibold">Billing</h1>

        <div v-if="errorMessage" class="alert alert-error alert-soft mt-6">{{ errorMessage }}</div>
        <div v-if="pending" class="flex justify-center py-20">
            <span class="loading loading-spinner loading-lg text-primary" />
        </div>

        <div v-else class="mt-6 grid gap-5">
            <div v-if="subscription && plan" class="card border-primary border">
                <div class="card-body">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div class="flex items-center gap-2">
                                <h2 class="card-title">{{ plan.name }}</h2>
                                <span :class="['badge badge-soft', subscription.status === 'active' ? 'badge-success' : 'badge-warning']">
                                    {{ subscription.status }}
                                </span>
                            </div>
                            <p class="text-base-content/60 text-sm">
                                {{ plan.currency }} {{ plan.price }} / month · current period ends {{ formatDate(subscription.current_period_end) }}
                            </p>
                        </div>
                        <NuxtLink to="/pricing" class="btn btn-outline">Change plan</NuxtLink>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <div>
                            <div class="flex justify-between text-sm">
                                <span>Dynamic QR codes</span>
                                <span>{{ usage?.dynamic_qr_count || 0 }} / {{ plan.dynamic_qr }}</span>
                            </div>
                            <progress class="progress progress-primary mt-2 w-full" :value="percent(usage?.dynamic_qr_count || 0, plan.dynamic_qr)" max="100" />
                        </div>
                        <div>
                            <div class="flex justify-between text-sm">
                                <span>Scans this month</span>
                                <span>{{ (usage?.scans_this_month || 0).toLocaleString() }} / {{ plan.scans.toLocaleString() }}</span>
                            </div>
                            <progress class="progress progress-primary mt-2 w-full" :value="percent(usage?.scans_this_month || 0, plan.scans)" max="100" />
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="card border-base-content/10 border">
                <div class="card-body items-start">
                    <h2 class="card-title">No active subscription</h2>
                    <p class="text-base-content/60 text-sm">Static QR codes remain free. Choose a plan when you need editable destinations and analytics.</p>
                    <NuxtLink to="/pricing" class="btn btn-primary">View plans</NuxtLink>
                </div>
            </div>

            <div class="card border-base-content/10 border">
                <div class="card-body">
                    <h2 class="card-title">Payment method</h2>
                    <div class="flex items-center gap-3">
                        <div class="bg-base-200 rounded-box p-3"><span class="icon-[tabler--shield-lock] size-7" /></div>
                        <div>
                            <p class="font-medium">Managed by the payment provider</p>
                            <p class="text-base-content/50 text-sm">
                                Baboons QR-code does not store raw card details. Provider-specific billing portal support is added by the production BillingGateway.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="alert alert-soft alert-warning">
                <span class="icon-[tabler--bell-ringing] size-5" />
                <div>
                    <p class="font-medium">Subscription notifications are enabled</p>
                    <p class="text-sm">The scheduler checks upcoming renewal dates and failed payments; database and e-mail notifications are queued.</p>
                </div>
            </div>
        </div>
    </div>
</template>
