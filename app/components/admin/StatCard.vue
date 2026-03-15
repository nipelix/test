<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl border border-default p-5 hover:shadow-md transition-all"
    role="status"
    :aria-label="`${label}: ${value}`"
  >
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="iconBgClass">
        <UIcon :name="icon" class="w-5 h-5" :class="iconClass" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs text-muted uppercase tracking-wide truncate">{{ label }}</p>
        <USkeleton v-if="loading" class="h-7 w-20 mt-1" />
        <p v-else class="text-xl font-bold tabular-nums">{{ value }}</p>
      </div>
    </div>
    <div v-if="trend !== undefined && !loading" class="mt-2 text-xs flex items-center gap-1" :class="trend >= 0 ? 'text-green-600' : 'text-red-600'">
      <UIcon :name="trend >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="w-3.5 h-3.5" />
      <span>{{ Math.abs(trend) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  label: string
  value: string | number
  iconBgClass?: string
  iconClass?: string
  loading?: boolean
  trend?: number
}>(), {
  loading: false,
  trend: undefined
})
</script>
