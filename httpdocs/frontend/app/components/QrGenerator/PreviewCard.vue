<script setup lang="ts">
import type { QrDraft, QrImageFormat } from '~/types/qr';

defineProps<{ draft: QrDraft; previewUrl: string; imageFormat: QrImageFormat; pending: boolean }>();
defineEmits<{
    refresh: [];
    save: [];
    download: [];
    'update:image-size': [size: number];
    'update:image-format': [format: QrImageFormat];
}>();
</script>
<template>
    <aside class="card bg-base-100 border-base-content/10 sticky top-24 border shadow-sm">
        <div class="card-body p-5">
            <div class="flex items-center justify-between"><div><h2 class="font-semibold">Preview</h2><p class="text-base-content/60 text-xs">Scannable preview from renderer service</p></div><span :class="['badge badge-sm', draft.mode === 'dynamic' ? 'badge-primary' : 'badge-soft']">{{ draft.mode }}</span></div>
            <div class="bg-base-200 rounded-box my-4 flex aspect-square items-center justify-center p-6">
                <span v-if="pending" class="loading loading-spinner loading-lg" />
                <ResponsiveImage
                    v-else-if="previewUrl"
                    :src="previewUrl"
                    alt="QR code preview"
                    class="max-h-full max-w-full rounded-lg"
                    loading="eager"
                />
                <div v-else class="text-base-content/50 text-center"><span class="icon-[tabler--qrcode] mx-auto size-20" /><p class="mt-2 text-sm">Preview will appear here</p></div>
            </div>
            <div class="mb-4 grid gap-4">
                <label class="grid gap-2" for="qr-image-size">
                    <span class="flex items-center justify-between text-sm font-medium">
                        <span>Image size</span>
                        <span class="text-base-content/60 tabular-nums">{{ draft.design.width }} px</span>
                    </span>
                    <input
                        id="qr-image-size"
                        type="range"
                        class="range range-primary"
                        min="128"
                        max="1600"
                        step="1"
                        :value="draft.design.width"
                        aria-label="QR code image size"
                        @input="$emit('update:image-size', Number(($event.target as HTMLInputElement).value))"
                    />
                    <span class="text-base-content/50 flex justify-between text-xs"><span>128 px</span><span>1600 px</span></span>
                </label>
                <fieldset class="grid gap-2">
                    <legend class="text-sm font-medium">Image format</legend>
                    <div class="join w-full" role="radiogroup" aria-label="QR code image format">
                        <input
                            v-for="format in ['svg', 'png', 'jpg'] as const"
                            :key="format"
                            class="join-item btn btn-soft flex-1"
                            type="radio"
                            name="qr-image-format"
                            :value="format"
                            :aria-label="format.toUpperCase()"
                            :checked="imageFormat === format"
                            @change="$emit('update:image-format', format)"
                        />
                    </div>
                </fieldset>
            </div>
            <button class="btn btn-outline w-full" @click="$emit('refresh')"><span class="icon-[tabler--refresh] size-4" />Refresh preview</button>
            <div class="grid grid-cols-2 gap-2"><button class="btn btn-primary" @click="$emit('download')"><span class="icon-[tabler--download] size-4" />Download</button><button class="btn btn-soft" @click="$emit('save')"><span class="icon-[tabler--device-floppy] size-4" />Save</button></div>
            <p class="text-base-content/50 text-center text-xs">Static QR codes are free. Saving dynamic QR codes requires a plan.</p>
        </div>
    </aside>
</template>
