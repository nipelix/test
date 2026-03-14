<template>
  <div class="flex items-center gap-2">
    <button
      v-for="color in colors"
      :key="color.value"
      class="w-5 h-5 rounded-full border-2 transition-all cursor-pointer"
      :class="[
        auth.accentColor === color.value ? 'border-white scale-110 ring-2 ring-offset-1 ring-gray-400' : 'border-transparent',
      ]"
      :style="{ backgroundColor: color.hex }"
      :title="color.label"
      @click="auth.setAccentColor(color.value)"
    />
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()

const colors = [
  { value: 'green' as const, hex: '#28a745', label: 'Green' },
  { value: 'purple' as const, hex: '#9333ea', label: 'Purple' },
  { value: 'orange' as const, hex: '#f97316', label: 'Orange' },
  { value: 'red' as const, hex: '#dc3545', label: 'Red' }
]
</script>
