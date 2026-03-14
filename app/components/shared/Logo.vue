<template>
  <NuxtLink :to="localePath('/sportsbook')" class="flex items-center shrink-0">
    <img
      src="/icons/sinek2.svg"
      alt="Sinek2"
      :width="width"
      :height="height"
      :class="light ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert'"
    >
  </NuxtLink>
</template>

<script setup lang="ts">
const localePath = useLocalePath()

withDefaults(defineProps<{
  light?: boolean
  width?: number
  height?: number
}>(), {
  light: false,
  width: 140,
  height: 35
})
</script>
