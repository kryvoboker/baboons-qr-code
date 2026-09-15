<script setup lang="ts">
import type { ApiNotification } from '~/types/api';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });
useHead({ title: 'Notifications' });

const items = ref<ApiNotification[]>([]);
const pending = ref(true);
const errorMessage = ref('');

const load = async () => {
    pending.value = true;
    errorMessage.value = '';
    try {
        const response = await $fetch<{ data: ApiNotification[] }>('/api/bff/v1/notifications');
        items.value = response.data;
    } catch {
        errorMessage.value = 'Could not load notifications.';
    } finally {
        pending.value = false;
    }
};

const presentation = (item: ApiNotification) => {
    const event = String(item.data.event || 'account.event');
    const plan = String(item.data.plan_code || 'subscription');

    if (event === 'subscription.payment_succeeded') {
        const amount = `${String(item.data.amount || '')} ${String(item.data.currency || '')}`.trim();
        return {
            title: 'Payment successful',
            text: `${plan} renewed${amount ? ` · ${amount}` : ''}.`,
            icon: 'icon-[tabler--circle-check]',
            tone: 'text-success',
        };
    }

    if (event === 'subscription.payment_failed') {
        return {
            title: 'Subscription payment failed',
            text: `We could not renew ${plan}. Check your billing settings.`,
            icon: 'icon-[tabler--credit-card-off]',
            tone: 'text-error',
        };
    }

    if (event === 'subscription.renewal_reminder') {
        const end = item.data.current_period_end
            ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
                  new Date(String(item.data.current_period_end)),
              )
            : 'soon';
        return {
            title: 'Subscription renews soon',
            text: `${plan} is scheduled to renew ${end}.`,
            icon: 'icon-[tabler--bell-ringing]',
            tone: 'text-info',
        };
    }

    return {
        title: 'Account notification',
        text: 'There is an important update for your account.',
        icon: 'icon-[tabler--bell]',
        tone: 'text-base-content',
    };
};

const markRead = async (item: ApiNotification) => {
    if (item.read_at) return;
    await $fetch(`/api/bff/v1/notifications/${item.id}/read`, { method: 'PATCH' });
    item.read_at = new Date().toISOString();
};

const markAllRead = async () => {
    await $fetch('/api/bff/v1/notifications/read-all', { method: 'PATCH' });
    const now = new Date().toISOString();
    for (const item of items.value) item.read_at ||= now;
};

onMounted(() => void load());
</script>

<template>
    <div class="mx-auto max-w-4xl">
        <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 class="text-3xl font-semibold">Notifications</h1>
                <p class="text-base-content/60 text-sm">Billing and important account events only.</p>
            </div>
            <button class="btn btn-text btn-sm" :disabled="!items.some((item) => !item.read_at)" @click="markAllRead">
                Mark all read
            </button>
        </div>

        <div v-if="errorMessage" class="alert alert-error alert-soft mt-6">
            <span class="icon-[tabler--alert-circle] size-5" />
            <span>{{ errorMessage }}</span>
        </div>

        <div v-if="pending" class="flex justify-center py-20">
            <span class="loading loading-spinner loading-lg text-primary" />
        </div>

        <div v-else-if="items.length" class="card border-base-content/10 mt-6 border">
            <div class="divide-base-content/10 divide-y">
                <button
                    v-for="item in items"
                    :key="item.id"
                    type="button"
                    class="hover:bg-base-200/50 flex w-full gap-4 p-5 text-start"
                    @click="markRead(item)"
                >
                    <div class="relative shrink-0">
                        <div class="bg-base-200 rounded-box flex size-10 items-center justify-center">
                            <span :class="[presentation(item).icon, presentation(item).tone, 'size-5']" />
                        </div>
                        <span v-if="!item.read_at" class="bg-primary absolute -end-1 -top-1 size-2.5 rounded-full" />
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-start justify-between gap-2">
                            <h2 :class="['font-medium', !item.read_at ? 'text-base-content' : 'text-base-content/75']">
                                {{ presentation(item).title }}
                            </h2>
                            <span class="text-base-content/45 text-xs">
                                {{ new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(item.created_at)) }}
                            </span>
                        </div>
                        <p class="text-base-content/60 mt-1 text-sm">{{ presentation(item).text }}</p>
                    </div>
                </button>
            </div>
        </div>

        <div v-else class="border-base-content/20 rounded-box mt-6 border border-dashed p-12 text-center">
            <span class="icon-[tabler--bell-check] text-primary mx-auto size-10" />
            <h2 class="mt-3 text-lg font-medium">Nothing needs your attention</h2>
            <p class="text-base-content/60 mt-1 text-sm">Renewal and payment events will appear here.</p>
        </div>
    </div>
</template>
