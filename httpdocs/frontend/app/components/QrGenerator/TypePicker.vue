<script setup lang="ts">
import { qrKinds } from '~/data/qr-presets';
import type { QrKind } from '~/types/qr';
defineProps<{ modelValue: QrKind }>(); const emit = defineEmits<{ 'update:modelValue': [QrKind] }>();
</script>
<template>
    <div>
        <div class="mb-3 flex items-center justify-between"><div><h2 class="font-semibold">1. Choose QR type</h2><p class="text-base-content/60 text-sm">Start with what the scan should do.</p></div></div>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            <button v-for="item in qrKinds" :key="item.kind" type="button" :class="['border-base-content/10 hover:border-primary/60 rounded-box border p-3 text-start transition', modelValue === item.kind ? 'border-primary bg-primary/5 ring-primary/20 ring-2' : 'bg-base-100']" @click="emit('update:modelValue', item.kind)">
                <span :class="[item.icon, 'text-primary size-5']" /><span class="mt-2 block text-sm font-medium">{{ item.label }}</span><span class="text-base-content/50 block text-xs">{{ item.description }}</span>
            </button>
        </div>
    </div>
</template>
