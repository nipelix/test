<template>
  <div class="stat-card bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center"
        :class="iconBgClass"
      >
        <UIcon :name="icon" class="w-5 h-5" :class="iconClass" />
      </div>
      <div>
        <p class="text-xs text-muted uppercase tracking-wide">{{ label }}</p>
        <p class="text-xl font-bold">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  value: string | number
  iconBgClass?: string
  iconClass?: string
}>()
</script>
