<script setup lang="ts">
defineProps<{ mobileOpen: boolean }>(); defineEmits<{ close: [] }>();
const links = [
    { to: '/dashboard', label: 'Overview', icon: 'icon-[tabler--layout-dashboard]' },
    { to: '/qr-codes', label: 'QR codes', icon: 'icon-[tabler--qrcode]' },
    { to: '/templates', label: 'Templates', icon: 'icon-[tabler--template]' },
    { to: '/notifications', label: 'Notifications', icon: 'icon-[tabler--bell]' },
    { to: '/settings/profile', label: 'Settings', icon: 'icon-[tabler--settings]' },
];
</script>
<template>
    <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-black/40 lg:hidden" @click="$emit('close')" />
    <aside :class="['border-base-content/10 bg-base-100 fixed inset-y-0 start-0 z-50 w-72 border-e p-4 transition-transform lg:sticky lg:top-[65px] lg:z-10 lg:h-[calc(100vh-65px)] lg:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full']">
        <div class="mb-4 flex items-center justify-between lg:hidden"><span class="font-semibold">Menu</span><button class="btn btn-square btn-text btn-sm" @click="$emit('close')"><span class="icon-[tabler--x] size-5" /></button></div>
        <NuxtLink to="/#generator" class="btn btn-primary mb-4 w-full"><span class="icon-[tabler--plus] size-5" />Create QR code</NuxtLink>
        <nav class="menu gap-1">
            <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="menu-item" active-class="active"><span :class="[link.icon, 'size-5']" />{{ link.label }}</NuxtLink>
        </nav>
        <div class="border-base-content/10 mt-6 border-t pt-4"><div class="flex items-center justify-between text-sm"><span>Creator plan</span><span class="badge badge-soft badge-primary">42%</span></div><progress class="progress progress-primary mt-2 w-full" value="42" max="100" /><p class="text-base-content/60 mt-2 text-xs">21 of 50 dynamic QR codes used</p><NuxtLink class="btn btn-text btn-sm mt-2 px-0" to="/pricing">Manage plan</NuxtLink></div>
    </aside>
</template>
