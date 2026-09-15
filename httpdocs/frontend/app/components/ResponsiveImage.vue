<script setup lang="ts">
withDefaults(
    defineProps<{
        src: string;
        alt: string;
        class?: string;
        loading?: 'lazy' | 'eager';
        width?: number;
        height?: number;
    }>(),
    { width: 256, height: 256 },
);
</script>

<template>
    <img
        :src="src"
        :alt="alt"
        :class="$props.class"
        :loading="loading || 'lazy'"
        :width="width"
        :height="height"
        decoding="async"
    />
</template>
