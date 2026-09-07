<script setup lang="ts">
import type { QrListItem } from '~/types/qr';

defineProps<{ qr: QrListItem }>();
defineEmits<{
    useTemplate: [QrListItem];
    delete: [QrListItem];
}>();
</script>

<template>
    <article class="card border-base-content/10 bg-base-100 border transition hover:shadow-md">
        <div class="card-body p-4">
            <div class="flex gap-4">
                <div class="bg-base-200 rounded-box flex size-24 shrink-0 items-center justify-center p-2">
                    <ResponsiveImage :src="qr.previewUrl" :alt="`${qr.name} QR`" class="max-h-full max-w-full" />
                </div>

                <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                            <NuxtLink :to="`/qr-codes/${qr.id}`" class="truncate font-medium hover:underline">
                                {{ qr.name }}
                            </NuxtLink>
                            <div class="mt-1 flex flex-wrap gap-1">
                                <span :class="['badge badge-sm', qr.mode === 'dynamic' ? 'badge-primary' : 'badge-soft']">
                                    {{ qr.mode }}
                                </span>
                                <span class="badge badge-outline badge-sm">{{ qr.kind }}</span>
                                <span v-if="!qr.active" class="badge badge-warning badge-soft badge-sm">Paused</span>
                            </div>
                        </div>

                        <div class="dropdown relative inline-flex [--placement:bottom-end]">
                            <button class="dropdown-toggle btn btn-square btn-text btn-sm" aria-label="QR actions">
                                <span class="icon-[tabler--dots] size-5" />
                            </button>
                            <ul class="dropdown-menu hidden min-w-44">
                                <li><NuxtLink class="dropdown-item" :to="`/qr-codes/${qr.id}`">Edit</NuxtLink></li>
                                <li>
                                    <button class="dropdown-item" @click="$emit('useTemplate', qr)">Save as template</button>
                                </li>
                                <li>
                                    <button class="dropdown-item text-error" @click="$emit('delete', qr)">Delete</button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <p class="text-base-content/50 mt-2 truncate text-xs">{{ qr.destination }}</p>
                </div>
            </div>

            <div class="border-base-content/10 mt-3 flex items-center justify-between border-t pt-3 text-xs">
                <span class="text-base-content/60">{{ qr.folder }} · {{ qr.updatedAt }}</span>
                <span v-if="qr.mode === 'dynamic'" class="font-medium">
                    <span class="icon-[tabler--scan] me-1 inline-block size-4 align-text-bottom" />
                    {{ qr.scans.toLocaleString() }}
                </span>
                <span v-else class="text-base-content/50">No analytics</span>
            </div>
        </div>
    </article>
</template>
