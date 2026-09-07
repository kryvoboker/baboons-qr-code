<script setup lang="ts">
import type { QrDraft } from '~/types/qr';
defineProps<{ draft: QrDraft; previewUrl: string; pending: boolean }>(); defineEmits<{ refresh: []; save: []; download: [] }>();
</script>
<template>
    <aside class="card bg-base-100 border-base-content/10 sticky top-24 border shadow-sm">
        <div class="card-body p-5">
            <div class="flex items-center justify-between"><div><h2 class="font-semibold">Preview</h2><p class="text-base-content/60 text-xs">Scannable preview from renderer service</p></div><span :class="['badge badge-sm', draft.mode === 'dynamic' ? 'badge-primary' : 'badge-soft']">{{ draft.mode }}</span></div>
            <div class="bg-base-200 rounded-box my-4 flex aspect-square items-center justify-center p-6">
                <span v-if="pending" class="loading loading-spinner loading-lg" />
                <ResponsiveImage v-else-if="previewUrl" :src="previewUrl" alt="QR code preview" class="max-h-full max-w-full rounded-lg" eager />
                <div v-else class="text-base-content/50 text-center"><span class="icon-[tabler--qrcode] mx-auto size-20" /><p class="mt-2 text-sm">Preview will appear here</p></div>
            </div>
            <button class="btn btn-outline w-full" @click="$emit('refresh')"><span class="icon-[tabler--refresh] size-4" />Refresh preview</button>
            <div class="grid grid-cols-2 gap-2"><button class="btn btn-primary" @click="$emit('download')"><span class="icon-[tabler--download] size-4" />Download</button><button class="btn btn-soft" @click="$emit('save')"><span class="icon-[tabler--device-floppy] size-4" />Save</button></div>
            <p class="text-base-content/50 text-center text-xs">Static QR codes are free. Saving dynamic QR codes requires a plan.</p>
        </div>
    </aside>
</template>
