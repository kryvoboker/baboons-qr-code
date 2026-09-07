<script setup lang="ts">
import { designPresets, socialLogos } from '~/data/qr-presets';
import type { QrDraft, QrDesign } from '~/types/qr';

const draft = defineModel<QrDraft>({ required: true });
const storageBase = useRuntimeConfig().public.storageBase;
const uploadPending = ref(false);
const uploadError = ref('');

const guestSessionKey = () => {
    const keyName = 'baboons-guest-session';
    let key = localStorage.getItem(keyName);

    if (!key) {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        key = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
        localStorage.setItem(keyName, key);
    }

    return key;
};

const setPreset = (design: Partial<QrDesign>) => {
    draft.value.design = { ...draft.value.design, ...structuredClone(design) } as QrDesign;
};

const setLogo = (path: string) => {
    draft.value.design.image = `${storageBase}/images/presets/social/${path.split('/').pop()}`;
};

const uploadLogo = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploadPending.value = true;
    uploadError.value = '';

    try {
        const body = new FormData();
        body.append('logo', file);
        body.append('guest_session_key', guestSessionKey());

        const response = await $fetch<{ data: { url: string } }>('/api/assets/logo', {
            method: 'POST',
            body,
        });

        draft.value.design.image = response.data.url;
    } catch {
        uploadError.value = 'Could not upload the logo. Use PNG, JPG or WebP up to 2 MB.';
    } finally {
        uploadPending.value = false;
        input.value = '';
    }
};
</script>

<template>
    <div>
        <h2 class="font-semibold">3. Make it yours</h2>
        <p class="text-base-content/60 mb-3 text-sm">Use a template, then change only what matters.</p>

        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
                v-for="preset in designPresets"
                :key="preset.id"
                type="button"
                class="border-base-content/10 hover:border-primary rounded-box border p-3 text-start"
                @click="setPreset(preset.design)"
            >
                <span class="block text-sm font-medium">{{ preset.name }}</span>
                <span class="text-base-content/50 text-xs">{{ preset.description }}</span>
            </button>
        </div>

        <div class="divider my-4">Logo</div>
        <div class="flex flex-wrap gap-2">
            <button
                v-for="logo in socialLogos"
                :key="logo.id"
                type="button"
                class="btn btn-outline btn-sm"
                @click="setLogo(logo.path)"
            >
                <span :class="[logo.icon, 'size-4']" />
                {{ logo.name }}
            </button>

            <label class="btn btn-outline btn-sm cursor-pointer">
                <span v-if="uploadPending" class="loading loading-spinner loading-xs" />
                <span v-else class="icon-[tabler--upload] size-4" />
                Upload logo
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    class="hidden"
                    :disabled="uploadPending"
                    @change="uploadLogo"
                />
            </label>

            <button
                v-if="draft.design.image"
                type="button"
                class="btn btn-ghost btn-sm"
                @click="draft.design.image = undefined"
            >
                Remove
            </button>
        </div>

        <p v-if="uploadError" class="text-error mt-2 text-sm">{{ uploadError }}</p>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <label class="form-control">
                <span class="label-text mb-1">Dots color</span>
                <input v-model="draft.design.dotsOptions.color" type="color" class="input h-11 w-full p-1" />
            </label>
            <label class="form-control">
                <span class="label-text mb-1">Background</span>
                <input v-model="draft.design.backgroundOptions.color" type="color" class="input h-11 w-full p-1" />
            </label>
            <label class="form-control">
                <span class="label-text mb-1">Dots style</span>
                <select v-model="draft.design.dotsOptions.type" class="select">
                    <option>rounded</option>
                    <option>dots</option>
                    <option>classy</option>
                    <option>classy-rounded</option>
                    <option>square</option>
                    <option>extra-rounded</option>
                </select>
            </label>
            <label class="form-control">
                <span class="label-text mb-1">Error correction</span>
                <select v-model="draft.design.qrOptions.errorCorrectionLevel" class="select">
                    <option>L</option>
                    <option>M</option>
                    <option>Q</option>
                    <option>H</option>
                </select>
            </label>
        </div>
    </div>
</template>
