<script setup lang="ts">
const { preference, apply } = useTheme();
const options = [
    { value: 'system' as const, label: 'System', icon: 'icon-[tabler--device-desktop]' },
    { value: 'light' as const, label: 'Light', icon: 'icon-[tabler--sun]' },
    { value: 'black' as const, label: 'Dark', icon: 'icon-[tabler--moon]' },
];
</script>

<template>
    <div class="dropdown relative inline-flex [--placement:bottom-end]">
        <button type="button" class="dropdown-toggle btn btn-square btn-text btn-sm" aria-label="Theme">
            <span class="icon-[tabler--sun-moon] size-5" />
        </button>
        <ul class="dropdown-menu dropdown-open:opacity-100 hidden min-w-40" role="menu">
            <li v-for="item in options" :key="item.value">
                <button type="button" class="dropdown-item flex items-center justify-between" @click="apply(item.value)">
                    <span class="flex items-center gap-2"><span :class="[item.icon, 'size-4']" />{{ item.label }}</span>
                    <span v-if="preference === item.value" class="icon-[tabler--check] size-4" />
                </button>
            </li>
        </ul>
    </div>
</template>
