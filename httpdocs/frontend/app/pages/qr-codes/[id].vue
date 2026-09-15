<script setup lang="ts">
import { defaultDesign } from '~/data/qr-presets';
import type { ApiFolder, ApiQrCode } from '~/types/api';
import type { QrDraft } from '~/types/qr';
import { buildQrData, defaultFieldsFor } from '~/utils/qr-content';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });

const route = useRoute();
const config = useRuntimeConfig();
const qr = ref<ApiQrCode | null>(null);
const folders = ref<ApiFolder[]>([]);
const tab = ref<'content' | 'design' | 'analytics'>('content');
const pending = ref(true);
const saving = ref(false);
const message = ref('');
const previewUrl = ref('');
const previewPending = ref(false);
const analytics = ref<{
    total: number;
    last_30_days: number;
    daily: Array<{ day: string; scans: number }>;
    top_countries: Array<{ country: string | null; scans: number }>;
    top_devices: Array<{ device: string | null; scans: number }>;
} | null>(null);

const draft = ref<QrDraft>({
    name: '',
    kind: 'url',
    mode: 'static',
    fields: defaultFieldsFor('url'),
    data: '',
    destinationUrl: '',
    design: structuredClone(defaultDesign),
});

const effectiveData = computed(() => {
    if (!qr.value) return draft.value.data;
    return draft.value.mode === 'dynamic' ? `${config.public.backendBase}/r/${qr.value.slug}` : draft.value.data;
});

const load = async () => {
    pending.value = true;

    try {
        const [qrResponse, folderResponse] = await Promise.all([
            $fetch<{ data: ApiQrCode }>(`/api/bff/v1/qr-codes/${route.params.id}`),
            $fetch<{ data: ApiFolder[] }>('/api/bff/v1/folders'),
        ]);

        qr.value = qrResponse.data;
        folders.value = folderResponse.data;

        draft.value = {
            name: qr.value.name,
            kind: qr.value.kind,
            mode: qr.value.mode,
            fields: qr.value.payload?.fields || defaultFieldsFor(qr.value.kind),
            data: String(qr.value.payload?.data || ''),
            destinationUrl: String(qr.value.destination_url || ''),
            folderId: qr.value.qr_folder_id || undefined,
            design: structuredClone(qr.value.design || defaultDesign),
        };

        useHead({ title: `Edit ${qr.value.name}` });
        await refreshPreview();
    } finally {
        pending.value = false;
    }
};

const refreshPreview = async () => {
    if (!qr.value) return;
    previewPending.value = true;
    draft.value.data = buildQrData(draft.value);

    try {
        const blob = await $fetch<Blob>('/api/renderer/preview', {
            method: 'POST',
            body: {
                options: {
                    ...draft.value.design,
                    data: effectiveData.value,
                },
            },
            responseType: 'blob',
        });

        if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = URL.createObjectURL(blob);
    } finally {
        previewPending.value = false;
    }
};

const save = async () => {
    if (!qr.value) return;
    saving.value = true;
    message.value = '';
    draft.value.data = buildQrData(draft.value);

    try {
        const response = await $fetch<{ data: ApiQrCode }>(`/api/bff/v1/qr-codes/${qr.value.id}`, {
            method: 'PATCH',
            body: {
                name: draft.value.name,
                folder_id: draft.value.folderId || null,
                payload: {
                    data: draft.value.data,
                    fields: draft.value.fields,
                },
                design: draft.value.design,
                destination_url: draft.value.mode === 'dynamic' ? draft.value.data : null,
                is_active: qr.value.is_active,
            },
        });

        qr.value = response.data;
        message.value = 'Changes saved.';
        await refreshPreview();
    } catch {
        message.value = 'Could not save the changes.';
    } finally {
        saving.value = false;
    }
};

const loadAnalytics = async () => {
    if (qr.value?.mode !== 'dynamic') return;
    const response = await $fetch<{ data: typeof analytics.value }>(`/api/bff/v1/qr-codes/${qr.value.id}/analytics`);
    analytics.value = response.data;
};

watch(tab, (value) => {
    if (value === 'analytics' && analytics.value === null) void loadAnalytics();
});

let previewTimer: ReturnType<typeof setTimeout> | undefined;
watch(
    () => [draft.value.fields, draft.value.design],
    () => {
        if (previewTimer) clearTimeout(previewTimer);
        previewTimer = setTimeout(() => void refreshPreview(), 220);
    },
    { deep: true },
);

const saveAsTemplate = async () => {
    if (!qr.value) return;
    await $fetch(`/api/bff/v1/qr-codes/${qr.value.id}/template`, {
        method: 'POST',
        body: { name: `${draft.value.name} template` },
    });
    message.value = 'Template saved.';
};

const download = async () => {
    draft.value.data = buildQrData(draft.value);
    const blob = await $fetch<Blob>('/api/renderer/download', {
        method: 'POST',
        body: {
            options: { ...draft.value.design, data: effectiveData.value },
            format: 'png',
        },
        responseType: 'blob',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${draft.value.name || 'qr-code'}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
};

onMounted(() => void load());
onBeforeUnmount(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<template>
    <div>
        <div v-if="pending" class="flex justify-center py-20">
            <span class="loading loading-spinner loading-lg text-primary" />
        </div>

        <template v-else-if="qr">
            <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div class="breadcrumbs text-sm">
                        <ul>
                            <li><NuxtLink to="/qr-codes">QR codes</NuxtLink></li>
                            <li>{{ draft.name }}</li>
                        </ul>
                    </div>

                    <div class="mt-2 flex flex-wrap items-center gap-3">
                        <h1 class="text-3xl font-semibold">{{ draft.name }}</h1>
                        <span :class="['badge', draft.mode === 'dynamic' ? 'badge-primary' : 'badge-soft']">
                            {{ draft.mode }}
                        </span>
                        <label class="flex items-center gap-2 text-sm">
                            <input v-model="qr.is_active" type="checkbox" class="switch switch-primary switch-sm" />
                            Active
                        </label>
                    </div>
                    <p class="text-base-content/60 mt-1 text-sm">
                        Rename, regroup, redesign, change a dynamic destination, or inspect scans.
                    </p>
                </div>

                <div class="flex gap-2">
                    <button class="btn btn-outline" @click="saveAsTemplate">
                        <span class="icon-[tabler--template] size-4" />
                        Save as template
                    </button>
                    <button class="btn btn-primary" :disabled="saving" @click="save">
                        <span v-if="saving" class="loading loading-spinner loading-sm" />
                        <span v-else class="icon-[tabler--device-floppy] size-4" />
                        Save changes
                    </button>
                </div>
            </div>

            <div v-if="message" class="alert alert-soft mt-4 text-sm">
                <span class="icon-[tabler--info-circle] size-5" />
                <span>{{ message }}</span>
            </div>

            <div class="tabs tabs-bordered mt-6" role="tablist">
                <button
                    v-for="item in ['content', 'design', 'analytics'] as const"
                    :key="item"
                    role="tab"
                    :class="['tab capitalize', tab === item ? 'tab-active' : '']"
                    @click="tab = item"
                >
                    {{ item }}
                </button>
            </div>

            <div class="mt-5 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div class="card border-base-content/10 border">
                    <div class="card-body">
                        <template v-if="tab === 'content'">
                            <QrGeneratorContentPanel v-model="draft" :allow-mode-change="false" />

                            <div class="divider">Folder</div>
                            <label class="form-control">
                                <span class="label-text mb-1">Group this QR code</span>
                                <select v-model="draft.folderId" class="select">
                                    <option :value="undefined">Unfiled</option>
                                    <option v-for="folder in folders" :key="folder.id" :value="folder.id">
                                        {{ folder.name }}
                                    </option>
                                </select>
                            </label>
                        </template>

                        <QrGeneratorDesignPanel v-else-if="tab === 'design'" v-model="draft" />

                        <div v-else>
                            <div v-if="draft.mode === 'static'" class="alert alert-soft">
                                <span class="icon-[tabler--info-circle] size-5" />
                                <span>Analytics are available for dynamic QR codes.</span>
                            </div>

                            <template v-else-if="analytics">
                                <div class="grid gap-3 sm:grid-cols-3">
                                    <div class="stat bg-base-200 rounded-box">
                                        <div class="stat-title">Total scans</div>
                                        <div class="stat-value text-2xl">{{ analytics.total.toLocaleString() }}</div>
                                    </div>
                                    <div class="stat bg-base-200 rounded-box">
                                        <div class="stat-title">Last 30 days</div>
                                        <div class="stat-value text-2xl">{{ analytics.last_30_days.toLocaleString() }}</div>
                                    </div>
                                    <div class="stat bg-base-200 rounded-box">
                                        <div class="stat-title">Top device</div>
                                        <div class="stat-value text-2xl">{{ analytics.top_devices[0]?.device || '—' }}</div>
                                    </div>
                                </div>

                                <h3 class="mt-6 font-semibold">Daily scans</h3>
                                <AnalyticsMiniChart :values="analytics.daily.map((item) => Number(item.scans))" />

                                <div class="mt-6 grid gap-4 md:grid-cols-2">
                                    <div class="border-base-content/10 rounded-box border p-4">
                                        <h4 class="font-medium">Devices</h4>
                                        <div class="mt-3 space-y-2 text-sm">
                                            <div
                                                v-for="item in analytics.top_devices"
                                                :key="String(item.device)"
                                                class="flex justify-between"
                                            >
                                                <span>{{ item.device || 'Unknown' }}</span>
                                                <span>{{ item.scans }}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="border-base-content/10 rounded-box border p-4">
                                        <h4 class="font-medium">Countries</h4>
                                        <div class="mt-3 space-y-2 text-sm">
                                            <div
                                                v-for="item in analytics.top_countries"
                                                :key="String(item.country)"
                                                class="flex justify-between"
                                            >
                                                <span>{{ item.country || 'Unknown' }}</span>
                                                <span>{{ item.scans }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </template>

                            <span v-else class="loading loading-spinner text-primary" />
                        </div>
                    </div>
                </div>

                <div class="card border-base-content/10 sticky top-24 border">
                    <div class="card-body">
                        <div class="bg-base-200 rounded-box flex aspect-square items-center justify-center p-8">
                            <span v-if="previewPending" class="loading loading-spinner loading-lg text-primary" />
                            <ResponsiveImage
                                v-else-if="previewUrl"
                                :src="previewUrl"
                                :alt="draft.name"
                                class="max-h-full max-w-full"
                                eager
                            />
                        </div>

                        <button class="btn btn-outline" @click="refreshPreview">
                            <span class="icon-[tabler--refresh] size-4" />
                            Refresh preview
                        </button>
                        <button class="btn btn-outline" @click="download">
                            <span class="icon-[tabler--download] size-4" />
                            Download
                        </button>

                        <div v-if="draft.mode === 'dynamic'" class="alert alert-soft alert-info text-sm">
                            <span class="icon-[tabler--info-circle] size-5" />
                            <span>You can change the destination without changing the printed QR image.</span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
