<script setup lang="ts">
import type { ApiQrTemplate } from '~/types/api';

const storageBase = useRuntimeConfig().public.storageBase;
definePageMeta({ layout: 'dashboard', middleware: 'auth' });
useHead({ title: 'Templates' });

const templates = ref<ApiQrTemplate[]>([]);
const pending = ref(true);
const errorMessage = ref('');
const editingId = ref<number | null>(null);
const editingName = ref('');

const load = async () => {
    pending.value = true;
    errorMessage.value = '';

    try {
        const response = await $fetch<{ data: ApiQrTemplate[] }>('/api/bff/v1/templates');
        templates.value = response.data;
    } catch {
        errorMessage.value = 'Could not load templates.';
    } finally {
        pending.value = false;
    }
};

const useTemplate = async (template: ApiQrTemplate) => {
    sessionStorage.setItem(
        'baboons-pending-template',
        JSON.stringify({ kind: template.kind, design: template.design, name: `${template.name} QR` }),
    );
    await navigateTo('/?template=1#generator');
};

const beginRename = (template: ApiQrTemplate) => {
    editingId.value = template.id;
    editingName.value = template.name;
};

const rename = async (template: ApiQrTemplate) => {
    const name = editingName.value.trim();
    if (!name) return;

    const response = await $fetch<{ data: ApiQrTemplate }>(`/api/bff/v1/templates/${template.id}`, {
        method: 'PATCH',
        body: { name },
    });
    const index = templates.value.findIndex((item) => item.id === template.id);
    if (index >= 0) templates.value[index] = response.data;
    editingId.value = null;
};

const remove = async (template: ApiQrTemplate) => {
    if (!window.confirm(`Delete template "${template.name}"?`)) return;
    await $fetch(`/api/bff/v1/templates/${template.id}`, { method: 'DELETE' });
    templates.value = templates.value.filter((item) => item.id !== template.id);
};

onMounted(() => void load());
</script>

<template>
    <div>
        <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 class="text-3xl font-semibold">Templates</h1>
                <p class="text-base-content/60 text-sm">Reuse a saved design without rebuilding it from scratch.</p>
            </div>
            <NuxtLink to="/#generator" class="btn btn-primary">
                <span class="icon-[tabler--plus] size-5" />
                New QR
            </NuxtLink>
        </div>

        <div v-if="errorMessage" class="alert alert-error alert-soft mt-6">
            <span class="icon-[tabler--alert-circle] size-5" />
            <span>{{ errorMessage }}</span>
        </div>

        <div v-if="pending" class="flex justify-center py-20">
            <span class="loading loading-spinner loading-lg text-primary" />
        </div>

        <div v-else-if="templates.length" class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article v-for="template in templates" :key="template.id" class="card border-base-content/10 border">
                <div class="card-body">
                    <div class="bg-base-200 rounded-box flex aspect-video items-center justify-center overflow-hidden p-6">
                        <ResponsiveImage
                            v-if="template.preview_path"
                            :src="`${storageBase}/${template.preview_path}`"
                            :alt="`${template.name} preview`"
                            class="max-h-full max-w-full"
                        />
                        <span v-else class="icon-[tabler--qrcode] text-base-content/40 size-20" />
                    </div>

                    <form v-if="editingId === template.id" class="flex gap-2" @submit.prevent="rename(template)">
                        <input v-model="editingName" class="input input-sm flex-1" maxlength="120" autofocus />
                        <button class="btn btn-primary btn-sm">Save</button>
                    </form>
                    <div v-else class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <h2 class="truncate font-medium">{{ template.name }}</h2>
                            <p class="text-base-content/50 text-xs capitalize">{{ template.kind }} design</p>
                        </div>
                        <button class="btn btn-ghost btn-square btn-sm" aria-label="Rename template" @click="beginRename(template)">
                            <span class="icon-[tabler--pencil] size-4" />
                        </button>
                    </div>

                    <div class="grid grid-cols-[1fr_auto] gap-2">
                        <button class="btn btn-primary btn-sm" @click="useTemplate(template)">
                            <span class="icon-[tabler--template] size-4" />
                            Use template
                        </button>
                        <button class="btn btn-outline btn-square btn-sm" aria-label="Delete template" @click="remove(template)">
                            <span class="icon-[tabler--trash] size-4" />
                        </button>
                    </div>
                </div>
            </article>
        </div>

        <div v-else class="border-base-content/20 rounded-box mt-6 border border-dashed p-12 text-center">
            <span class="icon-[tabler--template] text-primary mx-auto size-10" />
            <h2 class="mt-3 text-lg font-medium">No saved templates yet</h2>
            <p class="text-base-content/60 mx-auto mt-1 max-w-md text-sm">
                Open any saved QR code and choose “Save as template”, then reuse its design here.
            </p>
            <NuxtLink to="/qr-codes" class="btn btn-outline mt-5">Browse QR codes</NuxtLink>
        </div>
    </div>
</template>
