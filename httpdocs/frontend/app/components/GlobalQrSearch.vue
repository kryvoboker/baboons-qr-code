<script setup lang="ts">
const props = defineProps<{ mobile?: boolean }>();
const query = ref('');
const submit = () => navigateTo({ path: '/qr-codes', query: query.value ? { search: query.value } : {} });
</script>

<template>
    <form :class="props.mobile ? 'w-full' : 'w-56 xl:w-72'" role="search" @submit.prevent="submit">
        <label class="input input-sm flex items-center gap-2">
            <span class="icon-[tabler--search] text-base-content/50 size-4" />
            <input
                v-model="query"
                :id="mobile ? 'mobile-qr-search' : 'desktop-qr-search'"
                name="search"
                type="search"
                class="grow"
                placeholder="Search QR codes…"
                aria-label="Search QR codes"
            />
            <kbd class="kbd kbd-sm hidden xl:inline">/</kbd>
        </label>
    </form>
</template>
