<script setup lang="ts">
// biome-ignore lint/style/useImportType: designPresets is referenced by the Vue template at runtime.
import { designPresets, socialLogos } from '~/data/qr-presets';
import type { QrDraft } from '~/types/qr';
import { arrayFrom, getLocalStorageItem, setLocalStorageItem } from '~/utils/helpers';

const draft = defineModel<QrDraft>({ required: true });
const storageBase = useRuntimeConfig().public.storageBase;
const uploadPending = ref(false);
const uploadError = ref('');

const guestSessionKey = () => {
    const keyName = 'baboons-guest-session';
    let key = getLocalStorageItem(keyName);

    if (!key) {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        key = arrayFrom(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
        setLocalStorageItem(keyName, key);
    }

    return key;
};

const setPreset = (shape: (typeof designPresets)[number]['shape']) => {
    draft.value.design.dotsOptions.type = shape.dots;
    draft.value.design.cornersSquareOptions.type = shape.cornersSquare;
    draft.value.design.cornersDotOptions.type = shape.cornersDot;
};

const isPresetActive = (shape: (typeof designPresets)[number]['shape']): boolean => {
    return (
        draft.value.design.dotsOptions.type === shape.dots &&
        draft.value.design.cornersSquareOptions.type === shape.cornersSquare &&
        draft.value.design.cornersDotOptions.type === shape.cornersDot
    );
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
                :class="isPresetActive(preset.shape) ? 'border-primary bg-primary/5' : ''"
                :aria-pressed="isPresetActive(preset.shape)"
                @click="setPreset(preset.shape)"
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

        <div class="mt-4 space-y-4">
            <section aria-labelledby="qr-dots-heading">
                <div class="container">
                    <div>
                <div class="mb-2">
                    <h3 id="qr-dots-heading" class="font-medium">Dots</h3>
                    <p class="text-base-content/50 text-xs">The shapes used for the QR code modules.</p>
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                    <label class="form-control">
                        <span class="label-text mb-1">Dots color</span>
                        <input v-model="draft.design.dotsOptions.color" type="color" class="input h-11 w-full p-1" />
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
                </div>
                    </div>
                </div>
            </section>

            <section aria-labelledby="qr-finder-frames-heading">
                <div class="container">
                    <div class="border-base-content/10 border-t pt-4">
                <div class="mb-2">
                    <h3 id="qr-finder-frames-heading" class="font-medium">Finder frames</h3>
                    <p class="text-base-content/50 text-xs">The outer shapes around the three QR code markers.</p>
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                    <label class="form-control">
                        <span class="label-text mb-1">Frame color</span>
                        <input v-model="draft.design.cornersSquareOptions.color" type="color" class="input h-11 w-full p-1" />
                    </label>
                    <label class="form-control">
                        <span class="label-text mb-1">Frame style</span>
                        <select v-model="draft.design.cornersSquareOptions.type" class="select">
                            <option>square</option>
                            <option>dot</option>
                            <option>extra-rounded</option>
                            <option>rounded</option>
                            <option>dots</option>
                            <option>classy</option>
                            <option>classy-rounded</option>
                        </select>
                    </label>
                </div>
                    </div>
                </div>
            </section>

            <section aria-labelledby="qr-finder-centers-heading">
                <div class="container">
                    <div class="border-base-content/10 border-t pt-4">
                <div class="mb-2">
                    <h3 id="qr-finder-centers-heading" class="font-medium">Finder centers</h3>
                    <p class="text-base-content/50 text-xs">The inner shapes inside the three QR code markers.</p>
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                    <label class="form-control">
                        <span class="label-text mb-1">Center color</span>
                        <input v-model="draft.design.cornersDotOptions.color" type="color" class="input h-11 w-full p-1" />
                    </label>
                    <label class="form-control">
                        <span class="label-text mb-1">Center style</span>
                        <select v-model="draft.design.cornersDotOptions.type" class="select">
                            <option>dot</option>
                            <option>square</option>
                            <option>rounded</option>
                            <option>dots</option>
                            <option>classy</option>
                            <option>classy-rounded</option>
                            <option>extra-rounded</option>
                        </select>
                    </label>
                </div>
                    </div>
                </div>
            </section>

            <section aria-labelledby="qr-other-settings-heading">
                <div class="container">
                    <div class="border-base-content/10 border-t pt-4">
                <h3 id="qr-other-settings-heading" class="mb-2 font-medium">Other settings</h3>
                <div class="grid gap-3 sm:grid-cols-2">
                    <label class="form-control">
                        <span class="label-text mb-1">Background</span>
                        <input v-model="draft.design.backgroundOptions.color" type="color" class="input h-11 w-full p-1" />
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
                </div>
            </section>
        </div>
    </div>
</template>
