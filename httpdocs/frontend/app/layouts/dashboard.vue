<script setup lang="ts">
const mobileOpen = ref(false);
</script>

<template>
    <div class="bg-base-100 min-h-screen">
        <DashboardTopbar @toggle-menu="mobileOpen = !mobileOpen" />
        <div class="mx-auto flex max-w-[1600px]">
            <DashboardSidebar :mobile-open="mobileOpen" @close="mobileOpen = false" />
            <main class="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8"><slot /></main>
        </div>
    </div>
</template>
