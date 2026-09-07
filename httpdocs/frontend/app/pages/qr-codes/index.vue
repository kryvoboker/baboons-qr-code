<script setup lang="ts">
import type { ApiFolder, ApiQrCode } from '~/types/api';
import type { QrListItem } from '~/types/qr';
import { toQrListItem } from '~/utils/qr-api';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });
useHead({ title: 'QR codes' });

const route = useRoute();
const storageBase = useRuntimeConfig().public.storageBase;
const search = ref(String(route.query.search || ''));
const mode = ref<'all' | 'static' | 'dynamic'>('all');
const folderId = ref<string>('all');
const view = ref<'grid' | 'list'>('grid');
const items = ref<QrListItem[]>([]);
const folders = ref<ApiFolder[]>([]);
const pending = ref(false);
const errorMessage = ref('');
const newFolder = ref('');
const creatingFolder = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

const loadFolders = async () => {
    const response = await $fetch<{ data: ApiFolder[] }>('/api/bff/v1/folders');
    folders.value = response.data;
};

const loadQrCodes = async () => {
    pending.value = true;
    errorMessage.value = '';

    try {
        const response = await $fetch<{ data: ApiQrCode[] }>('/api/bff/v1/qr-codes', {
            query: {
                search: search.value || undefined,
                mode: mode.value === 'all' ? undefined : mode.value,
                folder_id: folderId.value === 'all' ? undefined : folderId.value,
            },
        });

        items.value = response.data.map((qr) => toQrListItem(qr, storageBase));
    } catch {
        errorMessage.value = 'Could not load QR codes.';
    } finally {
        pending.value = false;
    }
};

const scheduleLoad = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void loadQrCodes(), 220);
};

watch([search, mode, folderId], scheduleLoad);

const createFolder = async () => {
    const name = newFolder.value.trim();
    if (!name) return;

    creatingFolder.value = true;
    try {
        await $fetch('/api/bff/v1/folders', { method: 'POST', body: { name } });
        newFolder.value = '';
        await loadFolders();
    } finally {
        creatingFolder.value = false;
    }
};

const saveAsTemplate = async (qr: QrListItem) => {
    await $fetch(`/api/bff/v1/qr-codes/${qr.id}/template`, {
        method: 'POST',
        body: { name: `${qr.name} template` },
    });
    await navigateTo('/templates');
};

const removeQr = async (qr: QrListItem) => {
    if (!window.confirm(`Delete "${qr.name}"?`)) return;
    await $fetch(`/api/bff/v1/qr-codes/${qr.id}`, { method: 'DELETE' });
    await loadQrCodes();
};

onMounted(async () => {
    await Promise.all([loadQrCodes(), loadFolders()]);
});
</script>

<template>
    <div>
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="text-3xl font-semibold">QR codes</h1>
                <p class="text-base-content/60 text-sm">Search, group, rename, reuse and inspect analytics.</p>
            </div>
            <NuxtLink to="/#generator" class="btn btn-primary">
                <span class="icon-[tabler--plus] size-5" />
                Create QR
            </NuxtLink>
        </div>

        <div class="border-base-content/10 bg-base-100 rounded-box mt-6 border p-3">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
                <label class="input flex flex-1 items-center gap-2">
                    <span class="icon-[tabler--search] size-5" />
                    <input
                        v-model="search"
                        type="search"
                        class="grow"
                        placeholder="Live search by name, destination or short code…"
                    />
                    <span class="badge badge-soft">{{ items.length }}</span>
                </label>

                <select v-model="folderId" class="select lg:w-48">
                    <option value="all">All folders</option>
                    <option v-for="folder in folders" :key="folder.id" :value="String(folder.id)">
                        {{ folder.name }} ({{ folder.qr_codes_count || 0 }})
                    </option>
                </select>

                <div class="join">
                    <button
                        v-for="item in ['all', 'dynamic', 'static'] as const"
                        :key="item"
                        :class="['btn btn-sm join-item', mode === item ? 'btn-primary' : 'btn-outline']"
                        @click="mode = item"
                    >
                        {{ item }}
                    </button>
                </div>

                <div class="join hidden sm:flex">
                    <button
                        :class="['btn btn-square btn-sm join-item', view === 'grid' ? 'btn-primary' : 'btn-outline']"
                        @click="view = 'grid'"
                    >
                        <span class="icon-[tabler--layout-grid] size-4" />
                    </button>
                    <button
                        :class="['btn btn-square btn-sm join-item', view === 'list' ? 'btn-primary' : 'btn-outline']"
                        @click="view = 'list'"
                    >
                        <span class="icon-[tabler--list] size-4" />
                    </button>
                </div>
            </div>

            <form class="mt-3 flex gap-2 sm:max-w-sm" @submit.prevent="createFolder">
                <input v-model="newFolder" class="input input-sm flex-1" placeholder="New folder name" maxlength="120" />
                <button class="btn btn-outline btn-sm" :disabled="creatingFolder || !newFolder.trim()">
                    <span class="icon-[tabler--folder-plus] size-4" />
                    Add folder
                </button>
            </form>
        </div>

        <div v-if="pending" class="flex justify-center py-14">
            <span class="loading loading-spinner loading-lg text-primary" />
        </div>

        <div v-else-if="errorMessage" class="alert alert-error alert-soft mt-4">
            <span class="icon-[tabler--alert-circle] size-5" />
            <span>{{ errorMessage }}</span>
        </div>

        <div
            v-else-if="items.length"
            :class="['mt-4 grid gap-4', view === 'grid' ? 'xl:grid-cols-2' : 'grid-cols-1']"
        >
            <QrCard
                v-for="qr in items"
                :key="qr.id"
                :qr="qr"
                @use-template="saveAsTemplate"
                @delete="removeQr"
            />
        </div>

        <div v-else class="border-base-content/10 rounded-box mt-4 border border-dashed p-12 text-center">
            <span class="icon-[tabler--search-off] text-base-content/40 mx-auto size-12" />
            <h2 class="mt-3 font-semibold">No QR codes found</h2>
            <p class="text-base-content/60 mt-1 text-sm">Try another search, clear a filter, or create your first QR.</p>
            <button
                class="btn btn-outline btn-sm mt-4"
                @click="search = ''; mode = 'all'; folderId = 'all'"
            >
                Clear filters
            </button>
        </div>
    </div>
</template>
