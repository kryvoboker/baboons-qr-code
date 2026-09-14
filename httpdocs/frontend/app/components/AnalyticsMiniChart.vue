<script setup lang="ts">defineProps<{
  values: number[]
}>();</script>
<template>
  <div class="flex h-24 items-end gap-1">
    <div v-for="(value, index) in values" :key="index" class="bg-primary/70 min-h-1 flex-1 rounded-t" :style="{ height: `${Math.max(4, value)}%` }"/>
  </div>
</template>