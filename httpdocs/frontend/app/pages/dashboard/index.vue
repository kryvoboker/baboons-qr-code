<script setup lang="ts">
import type { DashboardData } from '~/types/api';
import type { QrListItem } from '~/types/qr';
import { toQrListItem } from '~/utils/qr-api';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });
useHead({ title: 'Dashboard' });

const storageBase = useRuntimeConfig().public.storageBase;
const data = ref<DashboardData | null>(null);
const recentQrCodes = ref<QrListItem[]>([]);
const pending = ref(true);
const errorMessage = ref('');

const dateLabel = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
}).format(new Date());

const greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
});

const dailyValues = computed(() => (data.value?.daily || []).map((item) => Number(item.scans)));
const dynamicLimit = computed(() => data.value?.dynamic_qr_limit ?? null);
const scanLimit = computed(() => data.value?.scan_limit ?? null);
const usagePercent = computed(() => {
    if (!dynamicLimit.value) return 0;
    return Math.min(100, Math.round(((data.value?.dynamic_qr_count || 0) / dynamicLimit.value) * 100));
});

const stats = computed(() => [
    {
        label: 'Dynamic QR codes',
        value: dynamicLimit.value ? `${data.value?.dynamic_qr_count || 0} / ${dynamicLimit.value}` : String(data.value?.dynamic_qr_count || 0),
        icon: 'icon-[tabler--qrcode]',
    },
    {
        label: 'Scans this month',
        value: scanLimit.value
            ? `${(data.value?.scans_this_month || 0).toLocaleString()} / ${scanLimit.value.toLocaleString()}`
            : (data.value?.scans_this_month || 0).toLocaleString(),
        icon: 'icon-[tabler--scan]',
    },
    { label: 'Saved templates', value: String(data.value?.templates_count || 0), icon: 'icon-[tabler--template]' },
    { label: 'Active folders', value: String(data.value?.folders_count || 0), icon: 'icon-[tabler--folders]' },
]);

const load = async () => {
    pending.value = true;
    try {
        const response = await $fetch<{ data: DashboardData }>('/api/bff/v1/dashboard');
        data.value = response.data;
        recentQrCodes.value = response.data.recent_qr_codes.map((qr) => toQrListItem(qr, storageBase));
    } catch {
        errorMessage.value = 'Could not load the dashboard.';
    } finally {
        pending.value = false;
    }
};

onMounted(() => void load());
</script>

<template>
    <div>
        <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
                <p class="text-base-content/60 text-sm">{{ dateLabel }}</p>
                <h1 class="text-3xl font-semibold">{{ greeting }}</h1>
            </div>
            <NuxtLink to="/#generator" class="btn btn-primary">
                <span class="icon-[tabler--plus] size-5" />
                Create QR
            </NuxtLink>
        </div>

        <div v-if="errorMessage" class="alert alert-error alert-soft mt-6">{{ errorMessage }}</div>
        <div v-if="pending" class="flex justify-center py-20">
            <span class="loading loading-spinner loading-lg text-primary" />
        </div>

        <template v-else>
            <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div
                    v-for="stat in stats"
                    :key="stat.label"
                    class="stat border-base-content/10 bg-base-100 rounded-box border"
                >
                    <div class="stat-figure text-primary"><span :class="[stat.icon, 'size-6']" /></div>
                    <div class="stat-title">{{ stat.label }}</div>
                    <div class="stat-value text-2xl">{{ stat.value }}</div>
                </div>
            </div>

            <div class="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
                <div class="card border-base-content/10 border">
                    <div class="card-body">
                        <div class="flex items-center justify-between gap-3">
                            <div>
                                <h2 class="card-title">Scan activity</h2>
                                <p class="text-base-content/60 text-sm">Recent scans across your dynamic QR codes</p>
                            </div>
                            <NuxtLink class="btn btn-text btn-sm" to="/qr-codes">View QR codes</NuxtLink>
                        </div>
                        <AnalyticsMiniChart :values="dailyValues.length ? dailyValues : [0]" />
                    </div>
                </div>

                <div class="card border-base-content/10 border">
                    <div class="card-body">
                        <h2 class="card-title">Subscription</h2>
                        <template v-if="data?.subscription && data.plan">
                            <div class="flex items-center justify-between">
                                <span>{{ data.plan.name }}</span>
                                <span :class="['badge badge-soft', data.subscription.status === 'active' ? 'badge-success' : 'badge-warning']">
                                    {{ data.subscription.status }}
                                </span>
                            </div>
                            <div>
                                <div class="flex justify-between text-sm">
                                    <span>Dynamic QR</span>
                                    <span>{{ data.dynamic_qr_count }} / {{ data.dynamic_qr_limit }}</span>
                                </div>
                                <progress class="progress progress-primary mt-2 w-full" :value="usagePercent" max="100" />
                            </div>
                            <p class="text-base-content/60 text-sm">Renewal details and usage are available in Billing.</p>
                        </template>
                        <template v-else>
                            <p class="text-base-content/60 text-sm">
                                You are on the free static QR workflow. Upgrade only when you need dynamic destinations and analytics.
                            </p>
                        </template>
                        <NuxtLink class="btn btn-outline" :to="data?.subscription ? '/settings/billing' : '/pricing'">
                            {{ data?.subscription ? 'Manage billing' : 'View plans' }}
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <div class="card border-base-content/10 mt-6 border">
                <div class="card-body">
                    <div class="flex items-center justify-between">
                        <h2 class="card-title">Recent QR codes</h2>
                        <NuxtLink to="/qr-codes" class="btn btn-text btn-sm">All QR codes</NuxtLink>
                    </div>
                    <div v-if="recentQrCodes.length" class="grid gap-3 lg:grid-cols-2">
                        <QrCard v-for="qr in recentQrCodes" :key="qr.id" :qr="qr" />
                    </div>
                    <div v-else class="border-base-content/20 rounded-box border border-dashed p-8 text-center">
                        <p class="font-medium">Your QR library is empty.</p>
                        <p class="text-base-content/60 mt-1 text-sm">Create a free static QR code to get started.</p>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>