<script setup lang="ts">
defineProps<{ src: string; alt: string; class?: string; loading?: 'lazy' | 'eager' }>();
</script>

<template><img :src="src" :alt="alt" :class="$props.class" :loading="loading || 'lazy'" decoding="async" /></template>
