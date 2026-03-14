<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-4">
      <circle cx="50" cy="50" r="35" stroke="#28a745" stroke-width="4" fill="none" opacity="0.3" />
      <circle cx="50" cy="50" r="35" stroke="#28a745" stroke-width="4" fill="none" />
      <line x1="76" y1="76" x2="105" y2="105" stroke="#28a745" stroke-width="6" stroke-linecap="round" />
      <rect x="38" y="42" width="8" height="4" rx="1" fill="#28a745" opacity="0.4" />
      <rect x="50" y="42" width="8" height="4" rx="1" fill="#28a745" opacity="0.4" />
      <rect x="38" y="50" width="20" height="4" rx="1" fill="#28a745" opacity="0.4" />
    </svg>
    <p class="text-muted text-sm">{{ message || $t('sportsbook.no_events') }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>
