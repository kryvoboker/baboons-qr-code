<script setup lang="ts">defineEmits<{ toggleMenu: [] }>();</script>
<template>
    <header class="border-base-content/10 bg-base-100 sticky top-0 z-40 border-b">
        <div class="navbar px-4 sm:px-6">
            <div class="navbar-start gap-2">
                <button class="btn btn-square btn-text btn-sm lg:hidden" @click="$emit('toggleMenu')"><span class="icon-[tabler--menu-2] size-5" /></button>
                <NuxtLink to="/dashboard" class="flex items-center gap-2 font-semibold"><ResponsiveImage src="/images/brand/logo-mark.svg" alt="" class="size-8" />Baboons</NuxtLink>
            </div>
            <div class="navbar-center hidden w-full max-w-xl md:flex"><GlobalQrSearch /></div>
            <div class="navbar-end gap-1"><ThemeMenu /><NuxtLink to="/notifications" class="btn btn-square btn-text btn-sm"><span class="icon-[tabler--bell] size-5" /></NuxtLink><div class="avatar placeholder"><div class="bg-neutral text-neutral-content size-8 rounded-full"><span class="text-xs">RK</span></div></div></div>
        </div>
        <div class="border-base-content/10 border-t px-4 py-2 md:hidden"><GlobalQrSearch mobile /></div>
    </header>
</template>
